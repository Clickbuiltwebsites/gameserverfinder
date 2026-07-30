import Link from "next/link";
import {
  ALL_GAMES,
  ALL_PLAYSTYLES,
  ALL_REGIONS,
  hrefFor,
  isActiveMulti,
  isFiltered,
  toggleFlag,
  toggleMulti,
} from "@/lib/query";
import { GAME_LABEL, PLAYSTYLE_LABEL, REGION_LONG } from "@/lib/taxonomy";
import type { ListingQuery } from "@/lib/types";

/**
 * Filters are plain links, not client state. Every combination is a real URL —
 * shareable, bookmarkable, indexable, and working with JavaScript switched off.
 */
export function Filters({
  query,
  counts,
}: {
  query: ListingQuery;
  counts: Record<string, number>;
}) {
  const fivemSelected = query.games?.includes("FIVEM") ?? false;

  return (
    <aside className="filters" aria-label="Filter servers">
      <fieldset className="filters__group">
        <legend className="filters__legend">Game</legend>
        <div className="chips">
          {ALL_GAMES.map((game) => (
            <Link
              key={game}
              className="chip"
              href={toggleMulti(query, "games", game)}
              data-active={isActiveMulti(query, "games", game)}
              aria-pressed={isActiveMulti(query, "games", game)}
            >
              {GAME_LABEL[game]}
              <span className="chip__count">{counts[game] ?? 0}</span>
            </Link>
          ))}
        </div>
      </fieldset>

      <fieldset className="filters__group">
        <legend className="filters__legend">Region</legend>
        <div className="chips">
          {ALL_REGIONS.map((region) => (
            <Link
              key={region}
              className="chip"
              href={toggleMulti(query, "regions", region)}
              data-active={isActiveMulti(query, "regions", region)}
              aria-pressed={isActiveMulti(query, "regions", region)}
            >
              {REGION_LONG[region]}
            </Link>
          ))}
        </div>
      </fieldset>

      <fieldset className="filters__group">
        <legend className="filters__legend">Playstyle</legend>
        <div className="chips">
          {ALL_PLAYSTYLES.map((playstyle) => (
            <Link
              key={playstyle}
              className="chip"
              href={toggleMulti(query, "playstyles", playstyle)}
              data-active={isActiveMulti(query, "playstyles", playstyle)}
              aria-pressed={isActiveMulti(query, "playstyles", playstyle)}
            >
              {PLAYSTYLE_LABEL[playstyle]}
            </Link>
          ))}
        </div>
      </fieldset>

      <fieldset className="filters__group">
        <legend className="filters__legend">Combat</legend>
        <div className="chips">
          <Link
            className="chip"
            href={toggleFlag(query, "pvp", true)}
            data-active={query.pvp === true}
            aria-pressed={query.pvp === true}
          >
            PvP on
          </Link>
          <Link
            className="chip"
            href={toggleFlag(query, "pvp", false)}
            data-active={query.pvp === false}
            aria-pressed={query.pvp === false}
          >
            PvE only
          </Link>
        </div>
      </fieldset>

      {/* The drugs facet is a FiveM economy question, so it only appears once
          FiveM is the selected game. */}
      {fivemSelected ? (
        <fieldset className="filters__group">
          <legend className="filters__legend">Drug economy (FiveM)</legend>
          <div className="chips">
            <Link
              className="chip"
              href={toggleFlag(query, "drugs", true)}
              data-active={query.drugs === true}
              aria-pressed={query.drugs === true}
            >
              Has drugs
            </Link>
            <Link
              className="chip"
              href={toggleFlag(query, "drugs", false)}
              data-active={query.drugs === false}
              aria-pressed={query.drugs === false}
            >
              No drugs
            </Link>
          </div>
        </fieldset>
      ) : null}

      {isFiltered(query) ? (
        <Link className="link-arrow" href={hrefFor({})}>
          Clear filters
        </Link>
      ) : null}
    </aside>
  );
}
