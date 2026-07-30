/**
 * Renders the site-wide Open Graph card to public/og.png.
 *
 * Next.js already generates this image from src/app/opengraph-image.tsx during
 * `next build`. This script exists so you can eyeball the card without a build,
 * and so there is a plain static file to hand to anywhere that will not follow
 * meta tags (an email signature, a press kit, a partner's directory).
 *
 *   npm run og
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public");
const OUT_FILE = join(OUT_DIR, "og.png");

const mod: Record<string, unknown> = await import("../src/app/opengraph-image");

// tsx's CJS interop can nest the default export one level deeper than ESM does.
const candidate = mod.default;
const render = (
  typeof candidate === "function" ? candidate : (candidate as Record<string, unknown>)?.default
) as (() => Promise<Response>) | undefined;

if (typeof render !== "function") {
  throw new Error("Could not resolve the default export of src/app/opengraph-image.tsx");
}

const size = mod.size as { width: number; height: number };
const bytes = Buffer.from(await (await render()).arrayBuffer());

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, bytes);

console.log(
  `Wrote ${OUT_FILE} — ${size.width}×${size.height}, ${(bytes.length / 1024).toFixed(1)} KB`
);
