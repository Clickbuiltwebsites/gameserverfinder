import "server-only";
import { getPrisma, hasDatabase } from "./prisma";
import { DEMO_LISTINGS } from "./demo-listings";
import { slugify } from "./taxonomy";
import type { Game, Playstyle, Region } from "./taxonomy";
import type { Listing, ListingInput, ListingQuery } from "./types";

/**
 * Demo mode: no DATABASE_URL and not a production build. Listings are served
 * from memory so `npm run dev` works on a fresh clone. Vercel always sets
 * NODE_ENV=production, so this can never switch on in a deployment.
 */
export const DEMO_MODE = !hasDatabase && process.env.NODE_ENV !== "production";

if (!hasDatabase && process.env.NODE_ENV === "production") {
  console.error(
    "[gameserverfinder] DATABASE_URL is not set. Listing pages will render empty. " +
      "Set it in your Vercel project environment variables."
  );
}

/**
 * Mutations in demo mode land here and survive until the dev server restarts.
 *
 * Held on globalThis because Next builds separate module graphs for the RSC and
 * SSR passes: a plain module-level array would give a Server Action one copy and
 * the page that reads it back another, so a new listing would 404 immediately
 * after being created.
 */
const globalForMemory = globalThis as unknown as { gsfListings?: Listing[] };
const memory: Listing[] = (globalForMemory.gsfListings ??= DEMO_LISTINGS.map((l) => ({ ...l })));

function matches(listing: Listing, query: ListingQuery): boolean {
  if (listing.status !== "PUBLISHED") return false;
  if (query.games?.length && !query.games.includes(listing.game)) return false;
  if (query.regions?.length && !query.regions.includes(listing.region)) return false;
  if (query.playstyles?.length && !query.playstyles.includes(listing.playstyle)) return false;
  if (query.pvp !== undefined && listing.pvp !== query.pvp) return false;
  if (query.drugs !== undefined && listing.drugs !== query.drugs) return false;
  if (query.q) {
    const needle = query.q.toLowerCase();
    const haystack = `${listing.name} ${listing.tagline} ${listing.description}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function sortListings(rows: Listing[], sort: ListingQuery["sort"]): Listing[] {
  const copy = [...rows];
  if (sort === "players") {
    copy.sort((a, b) => b.avgPlayers - a.avgPlayers);
  } else {
    copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
  return copy;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(row: any): Listing {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    game: row.game as Game,
    region: row.region as Region,
    playstyle: row.playstyle as Playstyle,
    pvp: row.pvp,
    drugs: row.drugs ?? null,
    avgPlayers: row.avgPlayers,
    maxPlayers: row.maxPlayers ?? null,
    imageUrl: row.imageUrl ?? null,
    imageAlt: row.imageAlt ?? null,
    connectUrl: row.connectUrl ?? null,
    websiteUrl: row.websiteUrl ?? null,
    discordUrl: row.discordUrl ?? null,
    status: row.status,
    createdAt:
      row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    ownerId: row.ownerId,
    ownerName: row.owner?.name ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listListings(query: ListingQuery = {}): Promise<Listing[]> {
  if (DEMO_MODE) {
    const rows = sortListings(
      memory.filter((l) => matches(l, query)),
      query.sort
    );
    return query.take ? rows.slice(0, query.take) : rows;
  }
  if (!hasDatabase) return [];

  const prisma = getPrisma();
  const rows = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      ...(query.games?.length ? { game: { in: query.games } } : {}),
      ...(query.regions?.length ? { region: { in: query.regions } } : {}),
      ...(query.playstyles?.length ? { playstyle: { in: query.playstyles } } : {}),
      ...(query.pvp !== undefined ? { pvp: query.pvp } : {}),
      ...(query.drugs !== undefined ? { drugs: query.drugs } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" as const } },
              { tagline: { contains: query.q, mode: "insensitive" as const } },
              { description: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: query.sort === "players" ? { avgPlayers: "desc" } : { createdAt: "desc" },
    take: query.take,
    include: { owner: { select: { name: true } } },
  });
  return rows.map(fromRow);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (DEMO_MODE) {
    return memory.find((l) => l.slug === slug && l.status === "PUBLISHED") ?? null;
  }
  if (!hasDatabase) return null;

  const row = await getPrisma().listing.findUnique({
    where: { slug },
    include: { owner: { select: { name: true } } },
  });
  if (!row || row.status !== "PUBLISHED") return null;
  return fromRow(row);
}

export async function listListingsByOwner(ownerId: string): Promise<Listing[]> {
  if (DEMO_MODE) {
    return sortListings(
      memory.filter((l) => l.ownerId === ownerId),
      "newest"
    );
  }
  if (!hasDatabase) return [];

  const rows = await getPrisma().listing.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });
  return rows.map(fromRow);
}

export async function countsByGame(): Promise<Record<Game, number>> {
  const empty: Record<Game, number> = { DAYZ: 0, FIVEM: 0, MINECRAFT: 0, RUST: 0 };

  if (DEMO_MODE) {
    for (const l of memory) {
      if (l.status === "PUBLISHED") empty[l.game] += 1;
    }
    return empty;
  }
  if (!hasDatabase) return empty;

  const grouped = await getPrisma().listing.groupBy({
    by: ["game"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
  });
  for (const row of grouped) {
    empty[row.game as Game] = row._count._all;
  }
  return empty;
}

async function slugIsTaken(slug: string): Promise<boolean> {
  if (DEMO_MODE) return memory.some((l) => l.slug === slug);
  if (!hasDatabase) return false;
  return Boolean(await getPrisma().listing.findUnique({ where: { slug }, select: { id: true } }));
}

/** Appends -2, -3 … until the slug is free. */
export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "server";
  let candidate = base;
  let n = 2;
  while (await slugIsTaken(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 200) {
      candidate = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return candidate;
}

export async function createListing(
  input: ListingInput,
  owner: { id: string; name: string | null }
): Promise<Listing> {
  const slug = await uniqueSlug(input.name);

  if (DEMO_MODE) {
    const listing: Listing = {
      ...input,
      id: `local-${Date.now().toString(36)}`,
      slug,
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      ownerId: owner.id,
      ownerName: owner.name,
    };
    memory.unshift(listing);
    return listing;
  }

  const row = await getPrisma().listing.create({
    data: { ...input, slug, ownerId: owner.id },
    include: { owner: { select: { name: true } } },
  });
  return fromRow(row);
}

/** Ownership is re-checked here, not just in the UI. */
export async function deleteListing(id: string, ownerId: string): Promise<boolean> {
  if (DEMO_MODE) {
    const index = memory.findIndex((l) => l.id === id && l.ownerId === ownerId);
    if (index === -1) return false;
    memory.splice(index, 1);
    return true;
  }
  if (!hasDatabase) return false;

  const result = await getPrisma().listing.deleteMany({ where: { id, ownerId } });
  return result.count > 0;
}
