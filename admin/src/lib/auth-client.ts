import { createAuthClient } from "better-auth/react"

const BASE_URL = (import.meta.env.VITE_BASEURL as string || 'http://localhost:3000').replace(/\/+$/, '')

export const authClient = createAuthClient({
    baseURL: BASE_URL,
    fetchOptions: {
        credentials: 'include',
        onSuccess: (ctx) => {
            const token = ctx.response.headers.get('set-auth-token')
            if (token) {
                localStorage.setItem('bearer_token', token)
            }
        },
        onError: (ctx) => {
            if (ctx.response.status === 401) {
                localStorage.removeItem('bearer_token')
            }
        },
        auth: {
            type: 'Bearer',
            token: () => localStorage.getItem('bearer_token') || '',
        },
    },
})

export const { signIn, signOut, useSession } = authClient
