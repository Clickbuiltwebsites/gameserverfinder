import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma, hasDatabase } from "@/lib/prisma";

/**
 * Two ways in, both requested by the brief:
 *
 *   Gmail  → the Google OAuth provider (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET)
 *   Email  → a magic link over SMTP     (EMAIL_SERVER / EMAIL_FROM)
 *
 * Each provider is only registered when its credentials are present, so a fresh
 * clone boots without secrets instead of crashing on startup. `configuredProviders`
 * is what the sign-in page reads to decide which buttons to render.
 */

export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

/** The email magic link needs the adapter's VerificationToken table. */
export const emailConfigured = Boolean(
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM && hasDatabase
);

export const configuredProviders = {
  google: googleConfigured,
  email: emailConfigured,
};

export const anyProviderConfigured = googleConfigured || emailConfigured;

const providers: NextAuthConfig["providers"] = [];

if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

if (emailConfigured) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60,
    })
  );
}

export const authConfig: NextAuthConfig = {
  // The adapter persists users and accounts. Without a database there is nothing
  // to persist to, so it is omitted and no provider will be registered either.
  adapter: hasDatabase ? PrismaAdapter(getPrisma()) : undefined,
  providers,
  // JWT sessions keep page renders off the database on every request. The
  // adapter still owns user records and email verification tokens.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
    error: "/signin",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
