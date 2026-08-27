import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import prisma from "../lib/prisma.js";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if (!session || !session?.user) {
            return res.status(401).json({message: "Unauthorized user"})
        }

        req.userId = session.user.id;

        next()
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: error.code || error.message})
    }
}

// Admin middleware: checks valid session AND isAdmin === true on the user.
// Returns 401 if no session, 403 if authenticated but not an admin.
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session || !session?.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check isAdmin flag directly from DB (not from Better Auth session object)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, isAdmin: true }
        });

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Forbidden — admin access required" });
        }

        req.userId = session.user.id;
        next();
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: error.code || error.message });
    }
};

// Maintenance mode middleware: blocks all non-admin API routes when enabled.
// Should be mounted BEFORE regular route handlers, AFTER admin routes.
export const maintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admin, auth, and health routes are always exempt
        if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth') || req.path.startsWith('/api/health') || req.path === '/health') {
            return next();
        }

        const setting = await prisma.systemSetting.findUnique({
            where: { id: 'maintenanceMode' }
        });

        if (setting?.value === 'true') {
            return res.status(503).json({
                message: "Buildo is currently undergoing scheduled maintenance. Please check back shortly.",
                maintenance: true
            });
        }

        next();
    } catch (error: any) {
        // If we can't read the setting, don't block — fail open
        console.error('[maintenanceMode middleware] Error reading setting:', error.message);
        next();
    }
};