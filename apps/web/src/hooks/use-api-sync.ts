// This file is intentionally a no-op now.
//
// Previously this hook called NestJS `/auth/sync` and stored a separate
// token in localStorage, which created two competing auth systems and
// caused /dashboard to 404 after email/password login.
//
// Auth is now unified: NextAuth (JWT session strategy) is the single
// source of truth. Every login method (Google, magic link, email+password)
// produces the same kind of session, and apps/web/src/lib/api.ts pulls
// the raw token from /api/auth/token on every request to NestJS, which
// validates it using the shared AUTH_SECRET.
//
// Kept as an empty component so existing imports don't break.
export function useApiSync() {}
export function ApiSync() { return null; }
