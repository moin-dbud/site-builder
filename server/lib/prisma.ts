import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

// Configure PostgreSQL connection pool for serverless Neon database
const pool = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

// Traps background connection terminations (e.g. Neon serverless compute autosuspend/idle drop)
// without crashing the Node.js process with unhandled error events.
pool.on('error', (err) => {
    console.warn('[pg pool warning] Idle connection terminated or dropped:', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;