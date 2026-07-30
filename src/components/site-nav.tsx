import Link from "next/link";
import { CommandPalette } from "./command-palette";
import { SignOutButton } from "./auth-buttons";
import type { SessionUser } from "@/lib/types";

export function SiteNav({ user }: { user: SessionUser | null }) {
  return (
    <header className="nav">
      <div className="shell nav__inner">
        <Link href="/" className="wordmark" aria-label="GameServerFinder home">
          <span className="wordmark__mark" aria-hidden="true" />
          GameServer<span className="wordmark__dim">Finder</span>
        </Link>

        <CommandPalette />

        <nav aria-label="Primary">
          <ul className="nav__links">
            <li>
              <Link className="nav__link nav__link--wide" href="/servers">
                Browse
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link className="nav__link" href="/dashboard">
                    My listings
                  </Link>
                </li>
                <li>
                  <SignOutButton demo={user.demo} />
                </li>
                <li>
                  <Link className="btn btn--primary" href="/submit">
                    List a server
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="nav__link" href="/signin">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="btn btn--primary" href="/submit">
                    List a server
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
