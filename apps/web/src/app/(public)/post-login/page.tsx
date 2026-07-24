'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Neutral landing spot used as the NextAuth callbackUrl for Google /
 * magic-link sign-in, where we can't know the user's role until the
 * redirect completes. Reads the fresh session and routes ADMIN users
 * straight to /admin, everyone else to /dashboard. The middleware is
 * still the actual security boundary — this page is just UX.
 */
export default function PostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.replace('/auth'); return; }
    const role = (session?.user as any)?.role;
    router.replace(role === 'ADMIN' ? '/admin' : '/dashboard');
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Loader2 size={28} className="text-brand-orange animate-spin" />
    </div>
  );
}
