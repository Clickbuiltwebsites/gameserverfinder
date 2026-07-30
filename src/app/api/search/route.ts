import { listListings } from "@/lib/repo";
import { GAME_LABEL, REGION_LABEL, formatPlayers } from "@/lib/taxonomy";

export const runtime = "nodejs";

/** Feeds the ⌘K palette. Returns at most 8 matches. */
export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json({ results: [] });

  const rows = await listListings({ q, take: 8, sort: "players" });

  return Response.json({
    results: rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      meta: `${GAME_LABEL[row.game]} · ${REGION_LABEL[row.region]} · ${formatPlayers(row.avgPlayers)} avg`,
    })),
  });
}
