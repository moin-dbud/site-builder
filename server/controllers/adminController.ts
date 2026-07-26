import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { getSetting as getSettingLib } from '../lib/settings.js';

// ─── Shared audit log helper ───────────────────────────────────────────────
export const logAdminAction = async (
    adminUserId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, any>
) => {
    try {
        await prisma.adminAuditLog.create({
            data: { adminUserId, action, targetType, targetId, details }
        });
    } catch (err: any) {
        console.error('[AdminAuditLog] Failed to write audit log:', err.message);
    }
};

// ─── Helper to get a SystemSetting value (with optional default) ───────────
const getSetting = async (key: string, fallback: string): Promise<string> => {
    const s = await prisma.systemSetting.findUnique({ where: { id: key } });
    return s?.value ?? fallback;
};

// ─── GET /api/admin/me ─────────────────────────────────────────────────────
export const getAdminMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, username: true, isAdmin: true, createdAt: true }
        });
        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            verifiedUsers,
            totalProjects,
            publishedProjects,
            totalTransactions,
            completedTransactions,
            revenueAgg,
            designSystemUsage,
            // Signups in last 30 days grouped by day
            recentSignups,
            // Credits consumed (estimate: count generations * credits per gen)
            openrouterToday,
            openrouterCap,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { emailVerified: true } }),
            prisma.websiteProject.count(),
            prisma.websiteProject.count({ where: { isPublished: true } }),
            prisma.transaction.count(),
            prisma.transaction.count({ where: { status: 'completed' } }),
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
            // Design system usage — group projects by designSystemId
            prisma.websiteProject.groupBy({
                by: ['designSystemId'],
                _count: { designSystemId: true },
                orderBy: { _count: { designSystemId: 'desc' } },
                take: 10
            }),
            // Signups per day (last 30 days)
            prisma.$queryRaw<{ date: string; count: bigint }[]>`
                SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
                FROM "user"
                WHERE "createdAt" > NOW() - INTERVAL '30 days'
                GROUP BY DATE("createdAt")
                ORDER BY date ASC
            `,
            getSetting('openrouterRequestsToday', '0'),
            getSetting('openrouterDailyCap', '200'),
        ]);

        // Fetch design system names from DB
        const dsIds = designSystemUsage.map(d => d.designSystemId).filter(Boolean) as string[];
        const dsSystems = await prisma.designSystem.findMany({
            where: { id: { in: dsIds } },
            select: { id: true, name: true }
        });
        const dsMap = Object.fromEntries(dsSystems.map(ds => [ds.id, ds.name]));

        // Credits consumed in last 30 days (count all version creates × credits per gen as estimate)
        const versionsCreated = await prisma.version.count({
            where: { timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        });

        // Revenue over time (last 30 days)
        const revenueOverTime = await prisma.$queryRaw<{ date: string; revenue: number }[]>`
            SELECT DATE("createdAt")::text AS date, SUM(amount)::float AS revenue
            FROM "Transaction"
            WHERE status = 'completed' AND "createdAt" > NOW() - INTERVAL '30 days'
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

        res.json({
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                unverified: totalUsers - verifiedUsers,
                recentSignups: recentSignups.map(r => ({ date: r.date, count: Number(r.count) }))
            },
            projects: {
                total: totalProjects,
                published: publishedProjects,
                draft: totalProjects - publishedProjects,
            },
            transactions: {
                total: totalTransactions,
                completed: completedTransactions,
                failed: totalTransactions - completedTransactions,
                totalRevenue: revenueAgg._sum.amount ?? 0,
                revenueOverTime
            },
            designSystems: designSystemUsage.map(d => ({
                id: d.designSystemId,
                name: dsMap[d.designSystemId ?? ''] ?? d.designSystemId ?? 'Unknown',
                count: d._count.designSystemId
            })),
            openrouter: {
                requestsToday: parseInt(openrouterToday),
                dailyCap: parseInt(openrouterCap),
            },
            generation: {
                versionsCreated30d: versionsCreated
            }
        });
    } catch (error: any) {
        console.error('[admin/stats]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/users ──────────────────────────────────────────────────
export const listUsers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const search = (req.query.search as string) || '';
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { username: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, email: true, username: true, name: true,
                    credits: true, emailVerified: true, isAdmin: true,
                    createdAt: true, totalCreation: true,
                    _count: { select: { projects: true, transactions: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────
export const getUserDetail = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, username: true, name: true,
                credits: true, emailVerified: true, isAdmin: true,
                createdAt: true, updatedAt: true, totalCreation: true,
                projects: {
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true, name: true, slug: true, isPublished: true,
                        featured: true, createdAt: true, updatedAt: true
                    }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true, gatewayOrderId: true, status: true,
                        amount: true, credits: true, planId: true, createdAt: true
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/users/:id/credits ───────────────────────────────────
export const adjustUserCredits = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body || {};
        const { delta, reason } = body;

        const numericDelta = Number(delta);
        if (isNaN(numericDelta)) {
            return res.status(400).json({ message: 'delta must be a valid number' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newCredits = Math.max(0, user.credits + numericDelta);
        const updated = await prisma.user.update({
            where: { id },
            data: { credits: newCredits }
        });

        // 1. Record in Transaction history
        await prisma.transaction.create({
            data: {
                gatewayOrderId: `ADMIN_ADJUST_${Date.now()}`,
                gatewayProvider: 'Admin Adjustment',
                status: 'completed',
                isPaid: true,
                planId: 'admin_adjustment',
                amount: 0,
                credits: numericDelta,
                userId: id
            }
        });

        // 2. Create User Notification for toast on next user login/access
        const reasonText = reason ? ` Reason: ${reason}` : '';
        const deltaFormatted = numericDelta > 0 ? `+${numericDelta}` : `${numericDelta}`;
        await prisma.userNotification.create({
            data: {
                userId: id,
                title: 'Credit Balance Updated',
                message: `An admin has adjusted your credit balance by ${deltaFormatted} credits.${reasonText}`
            }
        });

        await logAdminAction(req.userId!, 'ADJUST_CREDITS', 'user', id, {
            delta: numericDelta, reason, oldCredits: user.credits, newCredits
        });

        res.json({ credits: updated.credits, message: `Credits adjusted by ${deltaFormatted}` });
    } catch (error: any) {
        console.error('[adjustUserCredits error]:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// ─── PATCH /api/admin/users/:id/suspend ───────────────────────────────────
// Soft suspend: wipes credits to 0, marks as unverified to lock them out
export const suspendUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        if (id === req.userId) {
            return res.status(400).json({ message: 'Cannot suspend yourself' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete all sessions to force sign-out
        await prisma.session.deleteMany({ where: { userId: id } });

        await logAdminAction(req.userId!, 'SUSPEND_USER', 'user', id, {
            reason, targetEmail: user.email
        });

        res.json({ message: `User ${user.email} suspended and sessions revoked` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        if (id === req.userId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await logAdminAction(req.userId!, 'DELETE_USER', 'user', id, {
            reason, targetEmail: user.email, targetUsername: user.username
        });

        await prisma.user.delete({ where: { id } });

        res.json({ message: `User ${user.email} deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/projects ───────────────────────────────────────────────
export const listProjects = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const search = (req.query.search as string) || '';
        const filter = (req.query.filter as string) || 'all'; // all | published | featured
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (filter === 'published') where.isPublished = true;
        if (filter === 'featured') where.featured = true;

        const [projects, total] = await Promise.all([
            prisma.websiteProject.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, username: true, name: true } }
                }
            }),
            prisma.websiteProject.count({ where })
        ]);

        res.json({ projects, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/projects/:id/unpublish ──────────────────────────────
export const unpublishProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        const project = await prisma.websiteProject.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await prisma.websiteProject.update({
            where: { id },
            data: { isPublished: false }
        });

        await logAdminAction(req.userId!, 'UNPUBLISH_PROJECT', 'project', id, {
            reason, projectName: project.name, userId: project.userId
        });

        res.json({ message: 'Project unpublished successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/projects/:id/feature ────────────────────────────────
export const featureProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const project = await prisma.websiteProject.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newFeatured = !project.featured;
        await prisma.websiteProject.update({
            where: { id },
            data: { featured: newFeatured }
        });

        await logAdminAction(req.userId!, newFeatured ? 'FEATURE_PROJECT' : 'UNFEATURE_PROJECT', 'project', id, {
            projectName: project.name
        });

        res.json({ featured: newFeatured, message: newFeatured ? 'Project featured' : 'Project unfeatured' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── DELETE /api/admin/projects/:id ───────────────────────────────────────
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        const project = await prisma.websiteProject.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await logAdminAction(req.userId!, 'DELETE_PROJECT', 'project', id, {
            reason, projectName: project.name, userId: project.userId
        });

        await prisma.websiteProject.delete({ where: { id } });

        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/transactions ──────────────────────────────────────────
export const listTransactions = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const status = (req.query.status as string) || '';
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status && ['pending', 'completed', 'failed'].includes(status)) {
            where.status = status;
        }

        const [transactions, total, revenueAgg] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, username: true, name: true } }
                }
            }),
            prisma.transaction.count({ where }),
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'completed' } })
        ]);

        res.json({
            transactions, total, page, limit,
            pages: Math.ceil(total / limit),
            totalRevenue: revenueAgg._sum.amount ?? 0
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/design-systems ────────────────────────────────────────
export const listDesignSystems = async (req: Request, res: Response) => {
    try {
        const systems = await prisma.designSystem.findMany({ orderBy: { name: 'asc' } });
        res.json({ systems });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── POST /api/admin/design-systems ───────────────────────────────────────
export const createDesignSystem = async (req: Request, res: Response) => {
    try {
        const { id, name, keywords, palette, typography, spacing, radius, componentPatterns, layoutGuidance } = req.body;
        if (!id || !name) return res.status(400).json({ message: 'id and name are required' });

        const system = await prisma.designSystem.create({
            data: { id, name, keywords, palette, typography, spacing, radius, componentPatterns, layoutGuidance }
        });

        await logAdminAction(req.userId!, 'CREATE_DESIGN_SYSTEM', 'designSystem', id, { name });

        res.json({ system });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/design-systems/:id ──────────────────────────────────
export const updateDesignSystem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, keywords, palette, typography, spacing, radius, componentPatterns, layoutGuidance } = req.body;

        const system = await prisma.designSystem.update({
            where: { id },
            data: { name, keywords, palette, typography, spacing, radius, componentPatterns, layoutGuidance }
        });

        await logAdminAction(req.userId!, 'UPDATE_DESIGN_SYSTEM', 'designSystem', id, { name });

        res.json({ system });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/design-systems/:id/toggle ───────────────────────────
export const toggleDesignSystem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const system = await prisma.designSystem.findUnique({ where: { id } });
        if (!system) return res.status(404).json({ message: 'Design system not found' });

        const updated = await prisma.designSystem.update({
            where: { id },
            data: { isEnabled: !system.isEnabled }
        });

        await logAdminAction(req.userId!, updated.isEnabled ? 'ENABLE_DESIGN_SYSTEM' : 'DISABLE_DESIGN_SYSTEM', 'designSystem', id, { name: system.name });

        res.json({ isEnabled: updated.isEnabled });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/settings ───────────────────────────────────────────────
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const map = Object.fromEntries(settings.map(s => [s.id, s.value]));
        res.json({ settings: map });
    } catch (error: any) {
        console.error('[getSettings error]:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// ─── PATCH /api/admin/settings ────────────────────────────────────────────
export const updateSettings = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const { settings } = body as { settings: Record<string, string> };
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ message: 'settings object required' });
        }

        const updates = Object.entries(settings).map(([id, value]) =>
            prisma.systemSetting.upsert({
                where: { id },
                update: { value: String(value) },
                create: { id, value: String(value) }
            })
        );

        await Promise.all(updates);

        await logAdminAction(req.userId!, 'UPDATE_SETTINGS', 'system', undefined, { keys: Object.keys(settings) });

        res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
        console.error('[updateSettings error]:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// ─── GET /api/admin/audit-log ──────────────────────────────────────────────
export const getAuditLog = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.adminAuditLog.findMany({
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    adminUser: { select: { id: true, email: true, name: true } }
                }
            }),
            prisma.adminAuditLog.count()
        ]);

        res.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── POST /api/admin/danger/bulk-cleanup ──────────────────────────────────
// Deletes unverified user accounts older than 30 days
export const bulkCleanupUnverified = async (req: Request, res: Response) => {
    try {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Find candidates first for the audit log
        const candidates = await prisma.user.findMany({
            where: { emailVerified: false, createdAt: { lt: cutoff } },
            select: { id: true, email: true }
        });

        if (candidates.length === 0) {
            return res.json({ message: 'No unverified accounts older than 30 days found', deleted: 0 });
        }

        const ids = candidates.map(u => u.id);

        await prisma.user.deleteMany({ where: { id: { in: ids } } });

        await logAdminAction(req.userId!, 'BULK_CLEANUP_UNVERIFIED', 'user', undefined, {
            deleted: candidates.length,
            emails: candidates.map(u => u.email)
        });

        res.json({ message: `Deleted ${candidates.length} unverified accounts`, deleted: candidates.length });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/danger/maintenance ──────────────────────────────────
export const toggleMaintenance = async (req: Request, res: Response) => {
    try {
        const enabled = req.body.enabled === true || req.body.enabled === 'true';
        const value = enabled ? 'true' : 'false';

        await prisma.systemSetting.upsert({
            where: { id: 'maintenanceMode' },
            update: { value },
            create: { id: 'maintenanceMode', value }
        });

        await logAdminAction(req.userId!, enabled ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE', 'system', undefined, {});

        res.json({ maintenanceMode: enabled, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error: any) {
        console.error('[toggleMaintenance error]:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// ─── PATCH /api/admin/danger/freeze-cashfree ──────────────────────────────
export const toggleCashfreeFrozen = async (req: Request, res: Response) => {
    try {
        const { frozen } = req.body as { frozen: boolean };
        const value = frozen ? 'true' : 'false';

        await prisma.systemSetting.upsert({
            where: { id: 'cashfreeFrozen' },
            update: { value },
            create: { id: 'cashfreeFrozen', value }
        });

        await logAdminAction(req.userId!, frozen ? 'FREEZE_CASHFREE' : 'UNFREEZE_CASHFREE', 'system', undefined, {});

        res.json({ cashfreeFrozen: frozen, message: `Cashfree transactions ${frozen ? 'frozen' : 'unfrozen'}` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PATCH /api/admin/danger/email-verification ───────────────────────────
export const toggleEmailVerification = async (req: Request, res: Response) => {
    try {
        const { required } = req.body as { required: boolean };
        const value = required ? 'true' : 'false';

        await prisma.systemSetting.upsert({
            where: { id: 'emailVerificationRequired' },
            update: { value },
            create: { id: 'emailVerificationRequired', value }
        });

        await logAdminAction(req.userId!, required ? 'ENABLE_EMAIL_VERIFICATION' : 'DISABLE_EMAIL_VERIFICATION', 'system', undefined, {});

        res.json({
            emailVerificationRequired: required,
            message: `Email verification ${required ? 'enabled' : 'disabled'}`
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET /api/admin/public-settings ───────────────────────────────────────
// Public (no admin auth) — exposes only safe, client-needed flags
export const getPublicSettings = async (_req: Request, res: Response) => {
    try {
        const emailVerificationRequired = await getSettingLib('emailVerificationRequired');
        res.json({ emailVerificationRequired: emailVerificationRequired === 'true' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

