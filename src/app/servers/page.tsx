import Link from "next/link";
import type { Metadata } from "next";
import { Filters } from "@/components/filters";
import { ServerCard } from "@/components/server-card";
import { countsByGame, listListings } from "@/lib/repo";
import { hrefFor, isFiltered, parseSearchParams, sortHref } from "@/lib/query";

export const metadata: Metadata = {
  title: "Browse servers",
  description:
    "Every listed DayZ, FiveM, Minecraft and Rust server, filterable by region, playstyle, PvP and FiveM drug economy.",
};

export default async function ServersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parseSearchParams(raw);

  const [listings, counts] = await Promise.all([listListings(query), countsByGame()]);
  const filtered = isFiltered(query);

  return (
    <div className="shell browse">
      <Filters query={query} counts={counts} />

      <section>
        <div className="results__head">
          <div>
            <h1 className="rail__title">{filtered ? "Filtered servers" : "All servers"}</h1>
            <p className="results__count" aria-live="polite">
              {listings.length} {listings.length === 1 ? "server" : "servers"}
              {query.q ? ` matching “${query.q}”` : ""}
            </p>
          </div>

          <div className="chips">
            <Link
              className="chip"
              href={sortHref(query, "newest")}
              data-active={query.sort !== "players"}
            >
              Newest
            </Link>
            <Link
              className="chip"
              href={sortHref(query, "players")}
              data-active={query.sort === "players"}
            >
              Most players
            </Link>
          </div>
        </div>

        {listings.length ? (
          <div className="grid grid--wide">
            {listings.map((listing, index) => (
              <ServerCard key={listing.id} listing={listing} index={Math.min(index, 5)} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h2 className="empty__title">Nothing matches those filters.</h2>
            <p className="empty__body">
              {filtered
                ? "Try widening one of them — region and playstyle are the two that cut the list hardest."
                : "No servers have been listed yet. If you run one, it can be the first."}
            </p>
            {filtered ? (
              <Link className="btn" href={hrefFor({})}>
                Clear filters
              </Link>
            ) : (
              <Link className="btn btn--primary" href="/submit">
                List a server
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
