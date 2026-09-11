import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const rawConnectionString = process.env.DATABASE_URL || "";
const connectionString = rawConnectionString
    .replace(/channel_binding=require/gi, "")
    .replace(/sslmode=verify-full/gi, "sslmode=require")
    .replace(/[?&]$/, "");

// Configure PostgreSQL connection pool for Neon/Render deployments.
// `channel_binding` and `sslmode=verify-full` can cause connection failures
// in hosted environments, while `sslmode=require` is the safer default.
const pool = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Traps background connection terminations (e.g. Neon serverless compute autosuspend/idle drop)
// without crashing the Node.js process with unhandled error events.
pool.on('error', (err) => {
    console.warn('[pg pool warning] Idle connection terminated or dropped:', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;