import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared pieces for every Open Graph image on the site.
 *
 * Satori (which backs `next/og`) supports flexbox and a subset of CSS — no grid,
 * no oklch. So these use hex values matching the Midnight tokens rather than the
 * CSS custom properties the app itself uses.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** sRGB equivalents of the Midnight tokens — Satori supports no oklch(). */
export const OG_COLOR = {
  paper: "#050505",
  paper2: "#141312",
  paper3: "#1f1d1c",
  rule: "#2a2827",
  neutral: "#8f8b88",
  muted: "#c2beba",
  ink: "#efece9",
  accent: "#e2a163",
  accentDim: "#9c6a33",
  accentInk: "#150e06",
} as const;

const FONT_DIR = join(process.cwd(), "src", "assets", "fonts");

export async function ogFonts() {
  const [display, body, bodySemi] = await Promise.all([
    readFile(join(FONT_DIR, "BricolageGrotesque-ExtraBold.ttf")),
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "Geist-SemiBold.ttf")),
  ]);

  return [
    { name: "Bricolage", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Geist", data: body, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: bodySemi, weight: 600 as const, style: "normal" as const },
  ];
}

/** The 45°-rotated accent square from the site wordmark. */
export function OgMark({ size = 22 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: OG_COLOR.accent,
        borderRadius: 4,
        transform: "rotate(45deg)",
      }}
    />
  );
}

export function OgWordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <OgMark />
      <div
        style={{
          display: "flex",
          fontFamily: "Bricolage",
          fontSize: 34,
          letterSpacing: -1.4,
          color: OG_COLOR.ink,
        }}
      >
        GameServer
        <span style={{ color: OG_COLOR.neutral }}>Finder</span>
      </div>
    </div>
  );
}

/**
 * Kept as a no-op so the two card layouts don't need restructuring. The site's
 * canvas is flat black now, and the card follows it — the glow that used to sit
 * here was the same generated-looking gradient the page itself dropped.
 */
export function OgGlow() {
  return null;
}

export function OgPill({ label, tone = "quiet" }: { label: string; tone?: "quiet" | "accent" }) {
  const accent = tone === "accent";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        borderRadius: 999,
        fontFamily: "Geist",
        fontWeight: 600,
        fontSize: 24,
        background: accent ? OG_COLOR.accent : OG_COLOR.paper3,
        color: accent ? OG_COLOR.accentInk : OG_COLOR.muted,
        border: `1px solid ${accent ? OG_COLOR.accent : OG_COLOR.rule}`,
      }}
    >
      {label}
    </div>
  );
}
