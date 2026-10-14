import { createAuthClient } from 'better-auth/client'

// No baseURL: it defaults to the page origin plus /api/auth, which is the Vite
// dev proxy in development and the same origin in production.
export const authClient = createAuthClient()
