import { getSession } from 'next-auth/react';

/**
 * Retrieves the raw NextAuth JWT to send as a Bearer token to NestJS.
 * Next.js with NextAuth v5 + JWT strategy exposes the encoded token
 * via the /api/auth/session endpoint's cookie — but for client-side
 * Authorization headers we re-derive it through getSession() and
 * cache it briefly to avoid hammering the session endpoint.
 */
let cachedToken: { value: string | null; expiresAt: number } | null = null;

export async function getAuthToken(): Promise<string | null> {
  // Use short cache (10s) to avoid refetching session on every API call
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  try {
    const res = await fetch('/api/auth/token');
    if (!res.ok) { cachedToken = { value: null, expiresAt: Date.now() + 10000 }; return null; }
    const data = await res.json();
    cachedToken = { value: data.token ?? null, expiresAt: Date.now() + 10000 };
    return cachedToken.value;
  } catch {
    return null;
  }
}

export function clearTokenCache() {
  cachedToken = null;
}
