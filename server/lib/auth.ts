import 'dotenv/config'
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";
import { emailService } from "../email/emailService.js";

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

const requiredEnv = [
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
    'DATABASE_URL'
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Send welcome email as a non-blocking side-effect upon registration
                    emailService.sendWelcomeEmail(user.email, user.name || 'Creator').catch((err) => {
                        console.error('[BETTER-AUTH] Welcome email delivery failed:', err?.message || err)
                    })
                }
            }
        }
    },

    plugins: [
        bearer(),
    ],

    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: 3600, // 1 hour token lifetime
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            console.log(`[BETTER-AUTH] Password reset requested for user: ${user.email}`)
            try {
                await emailService.sendPasswordResetEmail(user.email, url, user.name || 'Creator')
            } catch (err: any) {
                console.error('[BETTER-AUTH] Email delivery failed:', err?.message || err)
            }
            console.log(`\n==========================================`)
            console.log(`[BUILD O PASSWORD RESET LINK]`)
            console.log(`User: ${user.email}`)
            console.log(`Reset URL: ${url}`)
            console.log(`==========================================\n`)
        },
    },
    user: {
        deleteUser: { enabled: true },
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
        ipAddress: {
            ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
        },
        cookies: {
            session_token: {
                name: "auth_session",
                attributes: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/'
                }
            }
        }
    }
});