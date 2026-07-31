/**
 * Stage 2 of `npm run logo` — rasterises the mark and crops the lockups.
 *
 * IMPORTANT: this file must never import `next/og`. See the header of
 * generate-logo-lockup.mts for why the two stages cannot share a process.
 *
 * Everything written here has a transparent background.
 */
import { readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "logo");
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/* -- The mark, rasterised from its SVG master ---------------------------- */

const markSvg = await readFile(join(OUT, "mark.svg"));

// Favicon/app-icon ladder. 180 is the Apple touch icon size.
const MARK_SIZES = [512, 256, 180, 128, 64, 32];

for (const size of MARK_SIZES) {
  // Render at high density first — rasterising a 64px viewBox straight to 512
  // leaves the 45° edges visibly stepped.
  const png = await sharp(markSvg, { density: 72 * 16 })
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(OUT, `mark-${size}.png`), png);
  console.log(`  mark-${size}.png — ${(png.length / 1024).toFixed(1)} KB`);
}

/* -- The lockups, cropped to their painted pixels ------------------------ */

for (const name of ["lockup-dark", "lockup-light"]) {
  const rawPath = join(OUT, `${name}.untrimmed.png`);
  const raw = await readFile(rawPath);

  const trimmed = await sharp(raw).trim({ background: TRANSPARENT }).png({ compressionLevel: 9 }).toBuffer();
  const meta = await sharp(trimmed).metadata();

  await writeFile(join(OUT, `${name}.png`), trimmed);
  await unlink(rawPath);
  console.log(
    `  ${name}.png — ${meta.width}x${meta.height}, ${(trimmed.length / 1024).toFixed(1)} KB`
  );
}

console.log("Logo kit written to public/logo/");
