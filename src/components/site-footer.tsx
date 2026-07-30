import Link from "next/link";

export function SiteFooter({ demoMode }: { demoMode: boolean }) {
  return (
    <footer className="foot">
      <div className="shell">
        <p className="foot__line">
          Every listing here was written by the person who runs the server.
        </p>

        <div className="foot__meta">
          <ul className="foot__links">
            <li>
              <Link className="foot__link" href="/servers">
                All servers
              </Link>
            </li>
            <li>
              <Link className="foot__link" href="/submit">
                List a server
              </Link>
            </li>
            <li>
              <Link className="foot__link" href="/servers?game=FIVEM">
                FiveM
              </Link>
            </li>
            <li>
              <Link className="foot__link" href="/servers?game=DAYZ">
                DayZ
              </Link>
            </li>
          </ul>
          <span>
            gameserverfinder.com
            {demoMode ? " · demo data, no database connected" : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
