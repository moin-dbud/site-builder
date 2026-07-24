import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import cashfreeRouter from "./routes/cashfreeRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { maintenanceMode } from "./middlewares/auth.js";

const app = express();

const rawOrigins = (process.env.TRUSTED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
    .filter(Boolean);

const allowedOrigins = Array.from(new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://buildo-rouge.vercel.app',
    ...rawOrigins
]));

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.trim().replace(/\/+$/, '');
        if (allowedOrigins.includes(normalized)) {
            return callback(null, true);
        }
        console.warn(`[CORS] Request from origin '${origin}' allowed.`);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
};

// ── 1. CORS Middleware ──────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── 2. Body Parser Middlewares (MUST come BEFORE any route handlers) ───────
// Raw-body capture for Cashfree webhook signature verification
app.use('/api/cashfree/webhook', express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ── 3. Better Auth Endpoint ────────────────────────────────────────────────
app.all('/api/auth/{*any}', toNodeHandler(auth));

// ── 4. Admin Router (Mounted AFTER express.json so req.body is parsed) ─────
app.use('/api/admin', adminRouter);

// ── 5. Maintenance Mode Middleware ─────────────────────────────────────────
// Mounted after admin routes so admin panel always remains accessible.
app.use(maintenanceMode);

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live! 🖕');
});

// ── 6. Application Routers ─────────────────────────────────────────────────
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
// DEPLOY NOTE: After deploying, update the webhook URL in Cashfree dashboard
// to https://yourserver.com/api/cashfree/webhook and set CASHFREE_ENV=production
app.use('/api/cashfree', cashfreeRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});