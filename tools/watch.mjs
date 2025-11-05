// tools/watch.mjs
import chokidar from "chokidar";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { stat } from "fs/promises";

const exec = promisify(execFile);

const ORIGINALS = path.resolve("originals");
const BUILD_CMD = ["npm", ["run", "build:images"]];
const UPLOAD_CMD = ["npm", ["run", "upload:r2"]];

let processing = false;
let queued = false;

/**
 * Run a command (npm script)
 */
async function run([cmd, args]) {
  const full = [cmd, ...args].join(" ");
  console.log(`⚙️  Running: ${full}`);
  try {
    const { stdout, stderr } = await exec(cmd, args);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (e) {
    console.error(`❌ Command failed: ${e.message}`);
    throw e;
  }
}

/**
 * Debounced workflow: build + upload
 */
async function processNewImages() {
  if (processing) {
    queued = true;
    return;
  }
  processing = true;
  console.log("🖼️  New photo detected — processing...");
  try {
    await run(BUILD_CMD);
    await run(UPLOAD_CMD);
    console.log("✅ Uploaded and manifest updated");
  } catch (e) {
    console.error("❌ Error during build/upload", e);
  } finally {
    processing = false;
    if (queued) {
      queued = false;
      await processNewImages(); // rerun once if queued
    }
  }
}

// Wait a short delay after a file is fully written
function debounce(fn, delay = 2000) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedProcess = debounce(processNewImages, 3000);

// Start watcher
console.log(`👀 Watching ${ORIGINALS} for new images...`);
chokidar
  .watch(ORIGINALS, { ignoreInitial: true, persistent: true })
  .on("add", async filePath => {
    const ext = path.extname(filePath).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return;

    // Confirm file fully written (size stable for 1 sec)
    let size1 = (await stat(filePath)).size;
    await new Promise(r => setTimeout(r, 1000));
    let size2 = (await stat(filePath)).size;
    if (size1 !== size2) {
      console.log("⏳ File still being written, skipping for now...");
      return;
    }

    console.log(`📸 New file detected: ${path.basename(filePath)}`);
    debouncedProcess();
  })
  .on("error", err => console.error("Watcher error:", err));
