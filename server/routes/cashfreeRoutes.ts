import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
    createCashfreeOrder,
    getCashfreeOrderStatus,
    cashfreeWebhook,
} from '../controllers/cashfreeController.js';

const cashfreeRouter = express.Router();

// Protected — requires logged-in user
cashfreeRouter.post('/create-order', protect, createCashfreeOrder);

// Protected — frontend polls this while on /payment/verify
cashfreeRouter.get('/order-status/:orderId', protect, getCashfreeOrderStatus);

// Public — called by Cashfree servers. Raw body parsing is handled in server.ts
// DEPLOY NOTE: Register this full URL in Cashfree dashboard → Developers → Webhooks
cashfreeRouter.post('/webhook', cashfreeWebhook);

export default cashfreeRouter;
