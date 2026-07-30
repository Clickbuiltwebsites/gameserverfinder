export const SITE_NAME = "GameServerFinder";
export const SITE_DOMAIN = "gameserverfinder.com";

export const SITE_DESCRIPTION =
  "A directory of DayZ, FiveM, Minecraft and Rust servers. Filter by region, " +
  "playstyle, whether PvP is on, and — for FiveM — whether the economy runs on drugs.";

/**
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so preview
 * builds resolve absolute URLs correctly without any manual configuration.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return `https://${SITE_DOMAIN}`;
}
