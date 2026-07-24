import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BASEURL || 'http://localhost:3000',
    fetchOptions: { credentials: 'include' },
})

export const { signIn, signOut, useSession } = authClient
