import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes
  const protectedPaths = ['/dashboard', '/learn'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const loginUrl = new URL('/auth', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*'],
};
