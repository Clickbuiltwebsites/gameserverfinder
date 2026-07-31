import Link from "next/link";
import { ServerCard } from "@/components/server-card";
import { countsByGame, listListings } from "@/lib/repo";
import { GAMES, GAME_BLURB, GAME_LABEL, formatPlayers } from "@/lib/taxonomy";

/**
 * This page reads no request-time API, so Next would otherwise prerender it once
 * at build and serve that snapshot forever. Publishing a listing calls
 * revalidatePath("/"), and this is the safety net for anything that changes the
 * table without going through the app (a seed, a manual edit, a moderation tool).
 */
export const revalidate = 60;

export default async function HomePage() {
  const [all, counts] = await Promise.all([listListings(), countsByGame()]);

  const newest = all.slice(0, 3);
  const busiest = [...all].sort((a, b) => b.avgPlayers - a.avgPlayers).slice(0, 3);
  const total = all.length;
  const ukCount = all.filter((l) => l.region === "UK").length;
  const usCount = all.filter((l) => l.region === "US").length;

  return (
    <>
      <section className="hero reveal" style={{ "--i": 0 } as React.CSSProperties}>
        <div className="shell hero__grid">
          <div>
            <h1 className="hero__title">Four games. Filters that mean something.</h1>
            <p className="hero__lede">
              DayZ, FiveM, Minecraft and Rust. Narrow by region, by playstyle, by whether PvP is
              on — and on FiveM, by whether the economy runs on drugs. Every description is
              written by the person who runs the server.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href="/servers">
                Browse servers
              </Link>
              <Link className="btn" href="/submit">
                List your server
              </Link>
            </div>
          </div>

          {/* Counts, not claims — each one is computed from the listings table.
              A description list requires dt before dd, and reading order should
              match the visual order, so the label leads and CSS does the rest. */}
          <dl className="hero__counts">
            <div>
              <dt className="count__label">Servers listed</dt>
              <dd className="count__value tabular">{formatPlayers(total)}</dd>
            </div>
            <div>
              <dt className="count__label">Games covered</dt>
              <dd className="count__value tabular">{GAMES.length}</dd>
            </div>
            <div>
              <dt className="count__label">US-hosted</dt>
              <dd className="count__value tabular">{formatPlayers(usCount)}</dd>
            </div>
            <div>
              <dt className="count__label">UK-hosted</dt>
              <dd className="count__value tabular">{formatPlayers(ukCount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="shell rail reveal" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="rail__head">
          <h2 className="rail__title">Just listed</h2>
          <Link className="link-arrow" href="/servers">
            All servers →
          </Link>
        </div>
        {newest.length ? (
          <div className="grid">
            {newest.map((listing, index) => (
              <ServerCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <EmptyRail />
        )}
      </section>

      <section className="shell rail rail--band reveal" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="rail__head">
          <h2 className="rail__title">By game</h2>
          <p className="rail__note">
            Each game gets its own filters. FiveM is the only one that asks about drugs.
          </p>
        </div>
        <div className="games">
          {GAMES.map((game) => (
            <Link key={game} className="game-card" href={`/servers?game=${game}`}>
              <h3 className="game-card__name">{GAME_LABEL[game]}</h3>
              <p className="game-card__blurb">{GAME_BLURB[game]}</p>
              <span className="game-card__count tabular">
                {counts[game]} {counts[game] === 1 ? "server" : "servers"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {busiest.length ? (
        <section className="shell rail reveal" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="rail__head">
            <h2 className="rail__title">Highest average population</h2>
            <Link className="link-arrow" href="/servers?sort=players">
              Sort the full list →
            </Link>
          </div>
          <div className="grid">
            {busiest.map((listing, index) => (
              <ServerCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function EmptyRail() {
  return (
    <div className="empty">
      <h3 className="empty__title">No servers listed yet.</h3>
      <p className="empty__body">
        Listings come from the people who run the servers. If you run one, put it here — it takes
        about two minutes and you keep control of the description.
      </p>
      <Link className="btn btn--primary" href="/submit">
        List a server
      </Link>
    </div>
  );
}
