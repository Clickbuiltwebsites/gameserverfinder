/**
 * Stage 1 of `npm run logo` — typesets the wordmark lockups.
 *
 * IMPORTANT: this file must never import `sharp`.
 *
 * next/og bundles its own sharp (node_modules/next/node_modules/sharp), and the
 * project has its own copy at a different version. Loading both into one Node
 * process puts two libvips binaries in memory, and libvips then reads a garbage
 * VipsInterpretation — every ImageResponse render dies with "colourspace:
 * parameter space not set". The import alone is enough; no sharp call required.
 *
 * So the pipeline is split: this stage renders and writes untrimmed PNGs, and
 * stage 2 (generate-logo-raster.mts, sharp-only) crops them in a fresh process.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createElement as h } from "react";
import { ImageResponse } from "next/og";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "logo");

await mkdir(OUT, { recursive: true });

const bricolage = await readFile(
  join(ROOT, "src", "assets", "fonts", "BricolageGrotesque-ExtraBold.ttf")
);

/**
 * Two variants, because a near-white lockup vanishes on a white page. The mark
 * keeps its amber in both — it is the brand constant.
 */
const VARIANTS = [
  { name: "lockup-dark", primary: "#edeae8", secondary: "#8f8b88" },
  { name: "lockup-light", primary: "#1a1816", secondary: "#706b67" },
] as const;

for (const variant of VARIANTS) {
  const element = h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        background: "transparent",
      },
    },
    h("div", {
      style: {
        width: 84,
        height: 84,
        background: "#e09a4d",
        borderRadius: 15,
        transform: "rotate(45deg)",
      },
    }),
    h(
      "div",
      {
        style: {
          display: "flex",
          fontFamily: "Bricolage",
          fontSize: 132,
          letterSpacing: -5.5,
          color: variant.primary,
        },
      },
      "GameServer",
      h("span", { style: { color: variant.secondary } }, "Finder")
    )
  );

  // Deliberately oversized: the rotated mark's corners and the glyph descenders
  // need room, and stage 2 crops back to the painted pixels anyway.
  const response = new ImageResponse(element, {
    width: 1600,
    height: 420,
    fonts: [{ name: "Bricolage", data: bricolage, weight: 800, style: "normal" }],
  });

  const buf = Buffer.from(await response.arrayBuffer());
  await writeFile(join(OUT, `${variant.name}.untrimmed.png`), buf);
  console.log(`  ${variant.name}.untrimmed.png — ${(buf.length / 1024).toFixed(1)} KB`);
}
