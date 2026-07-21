/**
 * Copy content/audios → public/audios for static export.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "content", "audios");
const DEST = path.join(ROOT, "public", "audios");

const AUDIO_EXT = new Set([".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac"]);

function isAudioFileName(name) {
  return AUDIO_EXT.has(path.extname(name).toLowerCase());
}

function ensureWritable(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const mode = fs.statSync(filePath).mode;
  // Owner write bit
  if (!(mode & 0o200)) {
    fs.chmodSync(filePath, mode | 0o200);
  }
}

if (!fs.existsSync(SRC)) {
  console.log("No content/audios directory; skipping audio sync");
  process.exit(0);
}

fs.mkdirSync(DEST, { recursive: true });

const files = fs
  .readdirSync(SRC)
  .filter((name) => {
    if (name.startsWith(".")) {
      return false;
    }
    const absolute = path.join(SRC, name);
    if (!fs.statSync(absolute).isFile()) {
      return false;
    }
    return isAudioFileName(name);
  });

for (const name of files) {
  const destPath = path.join(DEST, name);
  ensureWritable(destPath);
  fs.copyFileSync(path.join(SRC, name), destPath);
}

// Drop non-audio leftovers and stale public copies.
for (const name of fs.readdirSync(DEST)) {
  if (name.startsWith(".")) {
    continue;
  }
  const destPath = path.join(DEST, name);
  if (!fs.statSync(destPath).isFile()) {
    continue;
  }
  if (!isAudioFileName(name) || !files.includes(name)) {
    ensureWritable(destPath);
    fs.unlinkSync(destPath);
  }
}

console.log(
  files.length === 0
    ? "Synced 0 audio files"
    : `Synced ${files.length} audio file${files.length === 1 ? "" : "s"} → public/audios/`,
);
