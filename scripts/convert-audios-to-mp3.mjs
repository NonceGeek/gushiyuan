/**
 * Convert content/audios/*.wav → *.mp3 (libmp3lame, speech-friendly VBR).
 * Skips when mp3 is newer than wav.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIOS = path.join(ROOT, "content", "audios");
const POEMS = path.join(ROOT, "content", "poems");

const MP3_ARGS = [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  null,
  "-codec:a",
  "libmp3lame",
  "-q:a",
  "4",
  null,
];

function ffmpegAvailable() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function convertWavToMp3(wavPath, mp3Path) {
  const args = [...MP3_ARGS];
  args[args.indexOf(null)] = wavPath;
  args[args.lastIndexOf(null)] = mp3Path;
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

if (!fs.existsSync(AUDIOS)) {
  console.log("No content/audios directory");
  process.exit(0);
}

if (!ffmpegAvailable()) {
  console.error("ffmpeg not found; install ffmpeg to convert audio");
  process.exit(1);
}

const wavFiles = fs
  .readdirSync(AUDIOS)
  .filter((name) => name.toLowerCase().endsWith(".wav"))
  .sort();

if (wavFiles.length === 0) {
  console.log("No .wav files to convert");
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const wavName of wavFiles) {
  const wavPath = path.join(AUDIOS, wavName);
  const mp3Name = wavName.replace(/\.wav$/i, ".mp3");
  const mp3Path = path.join(AUDIOS, mp3Name);

  const wavMtime = fs.statSync(wavPath).mtimeMs;
  const mp3Exists = fs.existsSync(mp3Path);
  const mp3Mtime = mp3Exists ? fs.statSync(mp3Path).mtimeMs : 0;

  if (mp3Exists && mp3Mtime >= wavMtime) {
    skipped++;
    continue;
  }

  convertWavToMp3(wavPath, mp3Path);
  converted++;
  const wavBytes = fs.statSync(wavPath).size;
  const mp3Bytes = fs.statSync(mp3Path).size;
  console.log(
    `  ${wavName} → ${mp3Name} (${(wavBytes / 1024 / 1024).toFixed(1)} MiB → ${(mp3Bytes / 1024).toFixed(0)} KiB)`,
  );
  fs.unlinkSync(wavPath);
}

// Update poem frontmatter: *.wav → *.mp3 in audio JSON
let poemsUpdated = 0;
for (const file of fs.readdirSync(POEMS).filter((f) => f.endsWith(".md"))) {
  const mdPath = path.join(POEMS, file);
  const raw = fs.readFileSync(mdPath, "utf8");
  if (!raw.includes('.wav"')) {
    continue;
  }
  const next = raw.replace(/\.wav"/g, '.mp3"');
  if (next !== raw) {
    fs.writeFileSync(mdPath, next);
    poemsUpdated++;
  }
}

console.log(
  `Converted ${converted} wav${converted === 1 ? "" : "s"}, skipped ${skipped}, updated ${poemsUpdated} poem${poemsUpdated === 1 ? "" : "s"}`,
);
