import NextAuth from 'next-auth';
import GoogleProvider      from 'next-auth/providers/google';
import ResendProvider      from 'next-auth/providers/resend';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient }  from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // JWT strategy — no DB session row needed, works identically for
  // Google, magic-link, AND email/password. This is the single source
  // of truth for "is this user logged in" across the whole app.
  session: { strategy: 'jwt' },

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // Safe specifically for Google: it only issues this token for an email
    // it has already verified ownership of. Without this, NextAuth refuses
    // to link a Google sign-in to an existing account with the same email
    // (e.g. one created via email/password) — which is exactly what's
    // throwing OAuthAccountNotLinked right now.
    allowDangerousEmailAccountLinking: true,
    }),

    ResendProvider({
      apiKey: process.env.RESEND_API_KEY!,
      from:   'onboarding@resend.dev',
    }),

    // Real email + password login — validated directly against the
    // Account table (provider: 'credentials') where NestJS stores
    // the bcrypt hash on signup.
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() },
        });
        if (!user) return null;

        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'credentials' },
        });
        if (!account?.access_token) return null; // no password set (OAuth-only account)

        const valid = await bcrypt.compare(credentials.password as string, account.access_token);
        if (!valid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
        };
      },
    }),
  ],

  pages: {
    signIn:        '/auth',
    signOut:       '/auth',
    error:         '/auth?error=true',
    verifyRequest: '/auth?verify=true',
  },

  callbacks: {
    // Runs on sign-in and every subsequent token refresh
    async jwt({ token, user, trigger }) {
      if (user) {
  token.id = user.id;
  token.role = user.role;
}
      // Keep role fresh on every request without an extra DB call most of the time
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },

    // Exposes id + role on the client session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // After Google/magic-link sign-in, sync user into the same User table
    // NestJS reads from — guarantees one user, one row, everywhere.
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === 'credentials') return true; // already validated above

      try {
        await prisma.user.upsert({
          where:  { email: user.email },
          update: { name: user.name, image: user.image, lastActiveAt: new Date() },
          create: { email: user.email, name: user.name, image: user.image, emailVerified: new Date() },
        });
      } catch (e) {
        console.error('User sync failed:', e);
      }
      return true;
    },
  },

  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { lastActiveAt: new Date() },
        }).catch(() => {});
      }
    },
  },
});
