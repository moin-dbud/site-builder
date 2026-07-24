import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const rawOrigins = (process.env.TRUSTED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
    .filter(Boolean);

const trustedOrigins = Array.from(new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://buildo-rouge.vercel.app',
    ...rawOrigins
]));

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },
    user: {
        deleteUser: {enabled: true},
        additionalFields: {
            username: {
                type: "string",
                required: true,
                returned: true,
            }
        }
    },


    trustedOrigins,
    baseURL: process.env.BETTER_AUTH_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    advanced: {
        cookies: {
            session_token: {
                name: "auth_session",
                attributes: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/',
                }
            }
        }
    }

});