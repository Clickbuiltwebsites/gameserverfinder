import "server-only";
import { cookies } from "next/headers";
import { auth, anyProviderConfigured } from "@/auth";
import { DEMO_MODE } from "./repo";
import type { SessionUser } from "./types";

export const DEMO_COOKIE = "gsf_demo";

/**
 * The one demo identity. Only reachable when DEMO_MODE is on (no DATABASE_URL
 * and NODE_ENV !== "production"), so it cannot exist in a deployment.
 */
export const DEMO_USER: SessionUser = {
  id: "seed-user-1",
  name: "Maya Okonkwo",
  email: "maya@example.com",
  image: null,
  demo: true,
};

/**
 * Resolves the signed-in user from the Auth.js session, falling back to the
 * dev-only demo cookie. The cookie carries no user data — it is a flag, and the
 * identity is the constant above — so nothing user-supplied is ever trusted.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // Calling auth() with no provider and no AUTH_SECRET throws MissingSecret on
  // every render, which buries real errors in the dev log. Skip it instead.
  const session = anyProviderConfigured ? await auth() : null;
  const user = session?.user;

  if (user?.email) {
    return {
      id: user.id ?? user.email,
      name: user.name ?? null,
      email: user.email,
      image: user.image ?? null,
      demo: false,
    };
  }

  if (DEMO_MODE) {
    const store = await cookies();
    if (store.get(DEMO_COOKIE)?.value === "1") return DEMO_USER;
  }

  return null;
}
