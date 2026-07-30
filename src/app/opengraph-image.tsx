import { ImageResponse } from "next/og";
import {
  OG_COLOR,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgGlow,
  OgPill,
  OgWordmark,
  ogFonts,
} from "@/lib/og";

export const alt =
  "GameServerFinder — a directory of DayZ, FiveM, Minecraft and Rust servers";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Site-wide Open Graph card. Rendered once at build time. */
export default async function Image() {
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

        {/* Accent rule down the left edge — the one place accent takes real area */}
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

        <OgWordmark />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage",
              fontSize: 86,
              lineHeight: 1.02,
              letterSpacing: -3.6,
              color: OG_COLOR.ink,
              maxWidth: 900,
            }}
          >
            Four games. Filters that mean something.
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 27,
              lineHeight: 1.45,
              color: OG_COLOR.muted,
              maxWidth: 820,
            }}
          >
            Region, playstyle, PvP — and on FiveM, whether the economy runs on drugs.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <OgPill label="DayZ" />
            <OgPill label="FiveM" />
            <OgPill label="Minecraft" />
            <OgPill label="Rust" />
          </div>
          <div style={{ display: "flex", fontSize: 26, color: OG_COLOR.accent, fontWeight: 600 }}>
            gameserverfinder.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  );
}
