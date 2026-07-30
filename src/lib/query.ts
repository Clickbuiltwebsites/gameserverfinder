import {
  GAMES,
  PLAYSTYLES,
  REGIONS,
  isGame,
  isPlaystyle,
  isRegion,
} from "./taxonomy";
import type { Game, Playstyle, Region } from "./taxonomy";
import type { ListingQuery } from "./types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function triState(value: string | string[] | undefined): boolean | undefined {
  const first = asArray(value)[0];
  if (first === "yes") return true;
  if (first === "no") return false;
  return undefined;
}

/** Anything unrecognised is dropped rather than passed to the database. */
export function parseSearchParams(params: RawSearchParams): ListingQuery {
  const q = asArray(params.q)[0]?.trim();
  const sort = asArray(params.sort)[0];

  return {
    games: asArray(params.game).filter(isGame) as Game[],
    regions: asArray(params.region).filter(isRegion) as Region[],
    playstyles: asArray(params.playstyle).filter(isPlaystyle) as Playstyle[],
    pvp: triState(params.pvp),
    drugs: triState(params.drugs),
    q: q && q.length > 0 ? q.slice(0, 80) : undefined,
    sort: sort === "players" ? "players" : "newest",
  };
}

function toURLSearchParams(query: ListingQuery): URLSearchParams {
  const out = new URLSearchParams();
  query.games?.forEach((g) => out.append("game", g));
  query.regions?.forEach((r) => out.append("region", r));
  query.playstyles?.forEach((p) => out.append("playstyle", p));
  if (query.pvp !== undefined) out.set("pvp", query.pvp ? "yes" : "no");
  if (query.drugs !== undefined) out.set("drugs", query.drugs ? "yes" : "no");
  if (query.q) out.set("q", query.q);
  if (query.sort && query.sort !== "newest") out.set("sort", query.sort);
  return out;
}

export function hrefFor(query: ListingQuery): string {
  const params = toURLSearchParams(query);
  const search = params.toString();
  return search ? `/servers?${search}` : "/servers";
}

type MultiKey = "games" | "regions" | "playstyles";

/** Href that adds this value if absent, removes it if present. */
export function toggleMulti(
  query: ListingQuery,
  key: MultiKey,
  value: string
): string {
  const current = (query[key] ?? []) as string[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return hrefFor({ ...query, [key]: next } as ListingQuery);
}

export function isActiveMulti(query: ListingQuery, key: MultiKey, value: string): boolean {
  return ((query[key] ?? []) as string[]).includes(value);
}

/** Href that sets a boolean facet, or clears it when it is already set. */
export function toggleFlag(
  query: ListingQuery,
  key: "pvp" | "drugs",
  value: boolean
): string {
  const next = query[key] === value ? undefined : value;
  return hrefFor({ ...query, [key]: next });
}

export function sortHref(query: ListingQuery, sort: "newest" | "players"): string {
  return hrefFor({ ...query, sort });
}

export function isFiltered(query: ListingQuery): boolean {
  return Boolean(
    query.games?.length ||
      query.regions?.length ||
      query.playstyles?.length ||
      query.pvp !== undefined ||
      query.drugs !== undefined ||
      query.q
  );
}

export const ALL_GAMES = GAMES;
export const ALL_REGIONS = REGIONS;
export const ALL_PLAYSTYLES = PLAYSTYLES;
