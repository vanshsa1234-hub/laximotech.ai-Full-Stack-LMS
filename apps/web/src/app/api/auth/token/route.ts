import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { auth } from '@/lib/auth';

/**
 * Returns a bearer token for the current session so the client can call
 * the NestJS API. The API validates tokens signed with AUTH_SECRET and the
 * same payload shape used by the app’s auth flow.
 */
export async function GET(_req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ token: null, error: 'AUTH_SECRET not configured' }, { status: 500 });
  }

  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const email = session?.user?.email as string | undefined;
  const role = (session?.user as { role?: string } | undefined)?.role ?? 'STUDENT';

  if (!userId || !email) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const token = jwt.sign({ id: userId, sub: userId, email, role }, secret, { expiresIn: '7d' });
  return NextResponse.json({ token });
}
