import express from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import {
    getAdminMe,
    getDashboardStats,
    listUsers,
    getUserDetail,
    adjustUserCredits,
    suspendUser,
    deleteUser,
    listProjects,
    unpublishProject,
    featureProject,
    deleteProject,
    listTransactions,
    listDesignSystems,
    createDesignSystem,
    updateDesignSystem,
    toggleDesignSystem,
    getSettings,
    updateSettings,
    getAuditLog,
    bulkCleanupUnverified,
    toggleMaintenance,
    toggleCashfreeFrozen,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// All routes in this router require admin authentication
adminRouter.use(requireAdmin);

// ── Auth ──────────────────────────────────────────────────────────────────
adminRouter.get('/me', getAdminMe);

// ── Dashboard ─────────────────────────────────────────────────────────────
adminRouter.get('/stats', getDashboardStats);

// ── Users ─────────────────────────────────────────────────────────────────
adminRouter.get('/users', listUsers);
adminRouter.get('/users/:id', getUserDetail);
adminRouter.patch('/users/:id/credits', adjustUserCredits);
adminRouter.patch('/users/:id/suspend', suspendUser);
adminRouter.delete('/users/:id', deleteUser);

// ── Projects ──────────────────────────────────────────────────────────────
adminRouter.get('/projects', listProjects);
adminRouter.patch('/projects/:id/unpublish', unpublishProject);
adminRouter.patch('/projects/:id/feature', featureProject);
adminRouter.delete('/projects/:id', deleteProject);

// ── Transactions ──────────────────────────────────────────────────────────
adminRouter.get('/transactions', listTransactions);

// ── Design Systems ────────────────────────────────────────────────────────
adminRouter.get('/design-systems', listDesignSystems);
adminRouter.post('/design-systems', createDesignSystem);
adminRouter.patch('/design-systems/:id', updateDesignSystem);
adminRouter.patch('/design-systems/:id/toggle', toggleDesignSystem);

// ── System Settings ───────────────────────────────────────────────────────
adminRouter.get('/settings', getSettings);
adminRouter.patch('/settings', updateSettings);

// ── Audit Log ─────────────────────────────────────────────────────────────
adminRouter.get('/audit-log', getAuditLog);

// ── Danger Zone ───────────────────────────────────────────────────────────
adminRouter.post('/danger/bulk-cleanup', bulkCleanupUnverified);
adminRouter.patch('/danger/maintenance', toggleMaintenance);
adminRouter.patch('/danger/freeze-cashfree', toggleCashfreeFrozen);

export default adminRouter;
