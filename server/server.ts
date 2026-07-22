import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import cashfreeRouter from "./routes/cashfreeRoutes.js";

const app = express();

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim().replace(/^[\"']|[\"']$/g, '')) || [],
    credentials: true
}

// Middleware
app.use(cors(corsOptions))

app.all('/api/auth/{*any}', toNodeHandler(auth));

// ── Raw-body capture for Cashfree webhook signature verification ────────────
// Must come BEFORE express.json() so the webhook handler sees req.rawBody.
// Only applied to the webhook route to avoid overhead on other routes.
app.use('/api/cashfree/webhook', express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
}));

app.use(express.json({ limit: '50mb' }));

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live! 🖕');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
// DEPLOY NOTE: After deploying, update the webhook URL in Cashfree dashboard
// to https://yourserver.com/api/cashfree/webhook and set CASHFREE_ENV=production
app.use('/api/cashfree', cashfreeRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});