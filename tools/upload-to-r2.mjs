// tools/upload-to-r2.mjs
import { readdir, stat, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import "dotenv/config";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,       // e.g. https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  forcePathStyle: true,                    // important for R2
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const PUBLIC_DIR = "public";

// Calculate MD5 hash for a file (to match S3 ETag)
function getMd5Hash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// Check if file exists in R2 and matches local file
async function shouldUpload(key, localBuffer) {
  try {
    const response = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );

    // Get ETag without quotes
    const remoteETag = response.ETag?.replace(/"/g, '');
    const localMd5 = getMd5Hash(localBuffer);

    // If ETags match, file hasn't changed
    return remoteETag !== localMd5;
  } catch (error) {
    // File doesn't exist, need to upload
    return true;
  }
}

async function walk(dir, base = dir, out = []) {
  for (const name of await readdir(dir)) {
    const abs = path.join(dir, name);
    const st = await stat(abs);
    if (st.isDirectory()) {
      await walk(abs, base, out);
    } else {
      // relative path from base → POSIX style (forward slashes)
      const rel = path.relative(base, abs).replace(/\\/g, "/");
      out.push({ abs, rel });
    }
  }
  return out;
}

function cacheHeaders(key) {
  if (key === "manifest.json") return { "Cache-Control": "no-cache" };
  return { "Cache-Control": "public, max-age=31536000, immutable" };
}

function contentType(key) {
  if (key.endsWith(".json")) return "application/json";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

const files = await walk(PUBLIC_DIR);

let uploadedCount = 0;
let skippedCount = 0;

for (const f of files) {
  const Body = await readFile(f.abs);
  const Key = f.rel; // e.g. thumb/abc.jpg, full/abc.jpg, manifest.json

  // Check if we need to upload
  const needsUpload = await shouldUpload(Key, Body);

  if (needsUpload) {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key,
        Body,
        ContentType: contentType(Key),
        ...cacheHeaders(Key),
      })
    );

    console.log("✅ Uploaded:", Key);
    uploadedCount++;
  } else {
    console.log("⏭️  Skipped (unchanged):", Key);
    skippedCount++;
  }
}

console.log(`\n✅ Upload complete: ${uploadedCount} uploaded, ${skippedCount} skipped`);
