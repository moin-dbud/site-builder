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
    toggleEmailVerification,

    getComponents,
    getComponentById,
    createComponent,
    updateComponent,
    toggleComponent,
    updateComponentStatus,
    createComponentVersion,
    createComponentVariant,
    deleteComponent,

    getPublicSettings,
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

// ─── Component Registry ────────────────────────────────────────────────────

adminRouter.get('/components', getComponents);
adminRouter.get('/components/:id', getComponentById);

adminRouter.post('/components', createComponent);
adminRouter.patch('/components/:id', updateComponent);

adminRouter.patch('/components/:id/toggle', toggleComponent);
adminRouter.patch('/components/:id/status', updateComponentStatus);

adminRouter.post('/components/:id/versions', createComponentVersion);
adminRouter.post('/components/:id/variants', createComponentVariant);

adminRouter.delete('/components/:id', deleteComponent);

// ── System Settings ───────────────────────────────────────────────────────
adminRouter.get('/settings', getSettings);
adminRouter.patch('/settings', updateSettings);

// ── Audit Log ─────────────────────────────────────────────────────────────
adminRouter.get('/audit-log', getAuditLog);

// ── Danger Zone ───────────────────────────────────────────────────────────
adminRouter.post('/danger/bulk-cleanup', bulkCleanupUnverified);
adminRouter.patch('/danger/maintenance', toggleMaintenance);
adminRouter.patch('/danger/freeze-cashfree', toggleCashfreeFrozen);
adminRouter.patch('/danger/email-verification', toggleEmailVerification);

export default adminRouter;
