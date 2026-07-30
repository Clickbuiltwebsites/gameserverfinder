import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { GoogleSignInButton, DemoSignInButton } from "@/components/auth-buttons";
import { signInWithEmail } from "@/app/actions";
import { configuredProviders, anyProviderConfigured } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import { DEMO_MODE } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google or an email link to list a game server.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="shell auth">
      <div>
        <h1 className="auth__title">Sign in to list a server</h1>
        <p className="auth__lede" style={{ marginBlockStart: "var(--space-xs)" }}>
          You only need an account to publish or edit a listing. Browsing is open to everyone.
        </p>
      </div>

      {error ? (
        <p className="notice notice--error" role="alert">
          {error === "email"
            ? "That email address did not look right. Check it and try again."
            : "That sign-in attempt did not complete. Try again, or use the other method."}
        </p>
      ) : null}

      {configuredProviders.google ? <GoogleSignInButton /> : null}

      {configuredProviders.google && configuredProviders.email ? (
        <p className="auth__divider">or</p>
      ) : null}

      {configuredProviders.email ? (
        <form action={signInWithEmail} className="form">
          <div className="field">
            <label className="field__label" htmlFor="email">
              Email address
            </label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            <p className="field__help">
              We send a one-time link. There is no password to remember or lose.
            </p>
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Email me a sign-in link
          </button>
        </form>
      ) : null}

      {!anyProviderConfigured ? (
        <div className="notice notice--warn">
          <strong>No sign-in provider is configured yet.</strong>
          <br />
          Add <code>AUTH_GOOGLE_ID</code> and <code>AUTH_GOOGLE_SECRET</code> for Google, or{" "}
          <code>EMAIL_SERVER</code> and <code>EMAIL_FROM</code> for email links, then restart the
          server. The setup steps are in the project README.
        </div>
      ) : null}

      {DEMO_MODE ? (
        <>
          <p className="auth__divider">local development</p>
          <DemoSignInButton />
          <p className="field__help">
            Available only while <code>DATABASE_URL</code> is unset and you are not in production.
            Listings you create are held in memory and disappear when the dev server restarts.
          </p>
        </>
      ) : null}

      <p className="auth__lede">
        <Link className="link-inline" href="/servers">
          Keep browsing instead
        </Link>
      </p>
    </div>
  );
}
