import type { MetadataRoute } from "next";
import { listListings } from "@/lib/repo";
import { GAMES } from "@/lib/taxonomy";
import { siteUrl } from "@/lib/site";

/** Rebuilt hourly so newly published listings get indexed without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const listings = await listListings();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/servers`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.5 },
    ...GAMES.map((game) => ({
      url: `${base}/servers?game=${game}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...listings.map((listing) => ({
      url: `${base}/servers/${listing.slug}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
