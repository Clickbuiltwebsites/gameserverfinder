import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 moved the datasource URL out of schema.prisma. This file is what the
 * `prisma migrate` / `prisma db push` CLI reads; the running app gets its
 * connection from the pg driver adapter in `src/lib/prisma.ts`.
 *
 * An unset DATABASE_URL resolves to "" so `prisma generate` still works — only
 * the migration commands need a real URL, and they fail loudly without one.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
