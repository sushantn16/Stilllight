import sharp from "sharp";
import { globby } from "globby";
import { mkdir, writeFile } from "fs/promises";
import { basename } from "path";
import exifr from "exifr";

const SRC = "./originals";
const OUT_THUMB = "./public/thumb";
const OUT_FULL  = "./public/full";
const MANIFEST  = "./public/manifest.json";

// R2 public URL - update this with your R2 bucket's public URL
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-a92fe7c6ece0458c914ad88d5101a063.r2.dev";

await mkdir(OUT_THUMB, { recursive: true });
await mkdir(OUT_FULL, { recursive: true });

const files = await globby([`${SRC}/**/*.{jpg,jpeg,png,webp}`]);
const items = [];

for (const f of files) {
  const base = basename(f).replace(/\s+/g, "-").toLowerCase().replace(/\.(jpe?g|png|webp)$/i, "");
  const img = sharp(f).rotate(); // auto-orient

  // Read a few EXIF fields (GPS omitted by default)
  let exif = {};
  try {
    const raw = await exifr.parse(f, { gps: true });
    if (raw) {
      const pick = (k) => raw?.[k];
      exif = {
        Make: pick("Make"), Model: pick("Model"), LensModel: pick("LensModel"),
        ISO: pick("ISO"), FNumber: pick("FNumber"), ExposureTime: pick("ExposureTime"),
        CreateDate: pick("CreateDate")
      };
      // If you want to preserve GPS in UI, remove the next two lines:
      delete exif.GPSLatitude; delete exif.GPSLongitude;
    }
  } catch {}

  // Full (kept around 1600px)
  await img.clone().resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(`${OUT_FULL}/${base}.jpg`);

  // Thumb (≈480px) — smaller & no EXIF
  await img.clone().resize({ width: 480, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(`${OUT_THUMB}/${base}.jpg`);

  items.push({
    id: base,
    title: base.replace(/[-_]+/g, " "),
    thumb: `${R2_PUBLIC_URL}/thumb/${base}.jpg`,
    full:  `${R2_PUBLIC_URL}/full/${base}.jpg`,
    exif
  });
}

// Write manifest
await writeFile(MANIFEST, JSON.stringify({ items }, null, 2));
console.log(`Wrote ${items.length} items to ${MANIFEST}`);
