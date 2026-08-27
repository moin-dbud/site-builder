import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getHealthCheck = async (_req: Request, res: Response) => {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbError: string | undefined = undefined;

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (error: any) {
        dbStatus = 'unhealthy';
        dbError = error?.message || 'Database ping failed';
    }

    const latency = Date.now() - startTime;
    const isHealthy = dbStatus === 'healthy';

    const healthData = {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: {
                status: dbStatus,
                latencyMs: latency,
                ...(dbError ? { error: dbError } : {})
            }
        }
    };

    return res.status(isHealthy ? 200 : 503).json(healthData);
};
