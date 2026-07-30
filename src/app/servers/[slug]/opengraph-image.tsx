import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/repo";
import {
  GAME_LABEL,
  PLAYSTYLE_LABEL,
  REGION_LONG,
  drugsApplies,
  formatPlayers,
} from "@/lib/taxonomy";
import {
  OG_COLOR,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgGlow,
  OgPill,
  OgWordmark,
  ogFonts,
} from "@/lib/og";

export const alt = "Server listing on GameServerFinder";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Per-listing Open Graph card, rendered on demand for each server page. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  // Next 16 resolves route params through a promise here, same as a page.
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  const fonts = await ogFonts();

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: OG_COLOR.paper,
            color: OG_COLOR.ink,
            fontFamily: "Bricolage",
            fontSize: 56,
          }}
        >
          GameServerFinder
        </div>
      ),
      { ...size, fonts }
    );
  }

  // Long names need a smaller size or they wrap into the tagline.
  const titleSize = listing.name.length > 26 ? 64 : listing.name.length > 16 ? 78 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background: OG_COLOR.paper,
          padding: 72,
          fontFamily: "Geist",
        }}
      >
        <OgGlow />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: OG_COLOR.accent,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <OgWordmark />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: OG_COLOR.neutral,
            }}
          >
            {GAME_LABEL[listing.game]}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage",
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: OG_COLOR.ink,
              maxWidth: 1000,
            }}
          >
            {listing.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: OG_COLOR.muted,
              maxWidth: 900,
            }}
          >
            {listing.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <OgPill label={REGION_LONG[listing.region]} />
            <OgPill label={PLAYSTYLE_LABEL[listing.playstyle]} />
            <OgPill label={listing.pvp ? "PvP" : "PvE"} tone={listing.pvp ? "accent" : "quiet"} />
            {drugsApplies(listing.game) && listing.drugs ? (
              <OgPill label="Drug economy" />
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              color: OG_COLOR.ink,
            }}
          >
            <span style={{ fontFamily: "Bricolage", fontSize: 44, letterSpacing: -1.5 }}>
              {formatPlayers(listing.avgPlayers)}
            </span>
            <span style={{ fontSize: 24, color: OG_COLOR.neutral }}>avg players</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
