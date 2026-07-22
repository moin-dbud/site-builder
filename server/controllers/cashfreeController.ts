import { Request, Response } from 'express';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';

// ─── Helper to get configured Cashfree SDK instance ───────────────────────
// DEPLOY NOTE: Switch CASHFREE_ENV to "production" in your .env and update
// the webhook URL in the Cashfree dashboard to your live server URL.
const getCashfreeInstance = () => {
    const env = process.env.CASHFREE_ENV === 'production'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

    const appId = process.env.CASHFREE_APP_ID || '';
    const secretKey = process.env.CASHFREE_SECRET_KEY || '';

    // Set static properties
    Cashfree.XClientId = appId;
    Cashfree.XClientSecret = secretKey;
    Cashfree.XEnvironment = env;

    // Pass parameters to constructor so instance has credentials set
    return new Cashfree(env, appId, secretKey);
};

// ─── Plan definitions (mirrors the frontend appPlans array) ────────────────
// Keep in sync with client/src/assets/assets.ts → appPlans
const PLANS: Record<string, { name: string; amountINR: number; credits: number }> = {
    basic:      { name: 'Basic',      amountINR: 499,  credits: 100 },
    pro:        { name: 'Pro',        amountINR: 1499, credits: 400 },
    enterprise: { name: 'Enterprise', amountINR: 3999, credits: 1000 },
};

// ─── POST /api/cashfree/create-order ───────────────────────────────────────
export const createCashfreeOrder = async (req: Request, res: Response) => {
    const userId = req.userId;

    try {
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized user' });
        }

        const { planId } = req.body;
        const plan = PLANS[planId];
        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Fetch user details (needed for customer_details in Cashfree order)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a unique order ID
        const orderId = `buildo_${Date.now()}_${userId.slice(0, 8)}`;

        // DEPLOY NOTE: return_url uses VITE_FRONTEND_URL at build time.
        // Set VITE_FRONTEND_URL=https://yourdomain.com in your production env.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const serverUrl   = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

        const orderRequest = {
            order_id: orderId,
            order_amount: plan.amountINR,
            order_currency: 'INR',
            customer_details: {
                customer_id: userId,
                customer_email: user.email,
                customer_phone: '9999999999', // Cashfree requires a phone number
                customer_name: user.name,
            },
            order_meta: {
                // Cashfree appends {order_id} automatically when {order_id} appears in return_url
                return_url: `${frontendUrl}/payment/verify?order_id={order_id}`,
                // DEPLOY NOTE: Update this to your live server URL before going to production
                notify_url: `${serverUrl}/api/cashfree/webhook`,
            },
            order_note: `Buildo ${plan.name} plan — ${plan.credits} credits`,
        };

        const cashfree = getCashfreeInstance();
        const response = await cashfree.PGCreateOrder(orderRequest);
        const { payment_session_id, order_id } = response.data;

        // Store pending transaction record
        await prisma.transaction.create({
            data: {
                gatewayOrderId: orderId,
                gatewayProvider: 'cashfree',
                status: 'pending',
                planId,
                amount: plan.amountINR,
                credits: plan.credits,
                userId,
            },
        });

        res.json({ payment_session_id, order_id });

    } catch (error: any) {
        console.error('[Cashfree] create-order error:', error?.response?.data || error.message);
        res.status(500).json({ message: error?.response?.data?.message || error.message });
    }
};

// ─── GET /api/cashfree/order-status/:orderId ────────────────────────────────
// Polled by the frontend /payment/verify page to check transaction status.
// If pending, it directly checks Cashfree API as a fallback (essential for local dev).
export const getCashfreeOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { gatewayOrderId: orderId },
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // If already completed or failed, return status immediately
        if (transaction.status === 'completed' || transaction.status === 'failed') {
            return res.json({ status: transaction.status });
        }

        // Fallback check: If webhook hasn't updated it yet (e.g. local dev without ngrok),
        // query Cashfree API directly to verify payment status
        try {
            const cashfree = getCashfreeInstance();
            const cfOrder = await cashfree.PGFetchOrder(orderId);
            const cfStatus = cfOrder?.data?.order_status;

            if (cfStatus === 'PAID') {
                await prisma.$transaction([
                    prisma.transaction.update({
                        where: { gatewayOrderId: orderId },
                        data: { status: 'completed', isPaid: true },
                    }),
                    prisma.user.update({
                        where: { id: transaction.userId },
                        data: { credits: { increment: transaction.credits } },
                    }),
                ]);
                console.log(`[Cashfree Direct Verification] ✓ Credited ${transaction.credits} to user ${transaction.userId}`);
                return res.json({ status: 'completed' });
            }

            if (cfStatus === 'EXPIRED' || cfStatus === 'TERMINATED') {
                await prisma.transaction.update({
                    where: { gatewayOrderId: orderId },
                    data: { status: 'failed' },
                });
                return res.json({ status: 'failed' });
            }
        } catch (apiError: any) {
            console.error('[Cashfree Direct Verification] API error:', apiError?.response?.data || apiError.message);
        }

        res.json({ status: transaction.status });

    } catch (error: any) {
        console.error('[Cashfree] order-status error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── POST /api/cashfree/webhook ────────────────────────────────────────────
// Cashfree calls this after payment. Signature verification uses HMAC-SHA256
// of (timestamp + rawBody) with the client secret.
// DEPLOY NOTE: Register this URL in Cashfree dashboard → Developers → Webhooks
export const cashfreeWebhook = async (req: Request, res: Response) => {
    // Acknowledge immediately — Cashfree retries if it doesn't get a fast 200
    res.status(200).send('OK');

    try {
        const timestamp = req.headers['x-webhook-timestamp'] as string;
        const receivedSignature = req.headers['x-webhook-signature'] as string;
        const rawBody = (req as any).rawBody as string;
        const secretKey = process.env.CASHFREE_SECRET_KEY!;

        if (!timestamp || !receivedSignature || !rawBody) {
            console.error('[Cashfree Webhook] Missing required headers or body');
            return;
        }

        // Replay-attack guard: reject webhooks older than 5 minutes
        const webhookAge = Math.abs(Date.now() - parseInt(timestamp));
        if (webhookAge > 300_000) {
            console.error('[Cashfree Webhook] Timestamp too old — possible replay attack');
            return;
        }

        // Cashfree signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(timestamp + rawBody)
            .digest('base64');

        if (expectedSignature !== receivedSignature) {
            console.error('[Cashfree Webhook] Signature mismatch — request rejected');
            return;
        }

        const event = req.body;
        const eventType: string = event?.type || event?.event || '';
        const orderId: string = event?.data?.order?.order_id || event?.data?.payment?.order_id || '';
        const paymentStatus: string = event?.data?.payment?.payment_status || '';

        console.log(`[Cashfree Webhook] event=${eventType} order=${orderId} status=${paymentStatus}`);

        if (!orderId) {
            console.error('[Cashfree Webhook] Could not extract order_id from payload');
            return;
        }

        const transaction = await prisma.transaction.findUnique({
            where: { gatewayOrderId: orderId },
        });

        if (!transaction) {
            console.error(`[Cashfree Webhook] No transaction found for order ${orderId}`);
            return;
        }

        // Idempotency guard — don't credit twice
        if (transaction.status === 'completed') {
            console.log(`[Cashfree Webhook] Order ${orderId} already completed, skipping`);
            return;
        }

        // Cashfree sends PAYMENT_SUCCESS_WEBHOOK on success
        const isSuccess =
            eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
            paymentStatus === 'SUCCESS';

        if (isSuccess) {
            await prisma.$transaction([
                prisma.transaction.update({
                    where: { gatewayOrderId: orderId },
                    data: { status: 'completed', isPaid: true },
                }),
                prisma.user.update({
                    where: { id: transaction.userId },
                    data: { credits: { increment: transaction.credits } },
                }),
            ]);
            console.log(`[Cashfree Webhook] ✓ Credited ${transaction.credits} to user ${transaction.userId}`);
        } else {
            await prisma.transaction.update({
                where: { gatewayOrderId: orderId },
                data: { status: 'failed' },
            });
            console.log(`[Cashfree Webhook] ✗ Payment failed for order ${orderId}`);
        }

    } catch (error: any) {
        console.error('[Cashfree Webhook] Processing error:', error.message);
    }
};
