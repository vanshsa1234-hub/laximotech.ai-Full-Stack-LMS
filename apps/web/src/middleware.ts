import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as any;

  // Student/instructor-facing protected routes — any logged-in user is fine
  const protectedPaths = ['/dashboard', '/learn'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL('/auth', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin panel — requires login AND the ADMIN role. This is the real
  // security boundary; the client-side admin layout no longer needs to
  // (and can't safely) be trusted alone since it never ran a check before.
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user?.role !== 'ADMIN') {
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('error', 'admin_only');
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*', '/admin/:path*'],
};
