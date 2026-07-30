import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

/**
 * Lazily constructed so importing this module never throws when DATABASE_URL is
 * absent — the dev fallback in `repo.ts` depends on that. Cached on globalThis
 * so hot reload in dev doesn't open a new pool on every edit.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Set it in .env.local for local development, or in " +
          "the Vercel project environment variables for a deployment."
      );
    }
    const adapter = new PrismaPg({ connectionString });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
