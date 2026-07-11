/**
 * Build a tiny WenKai TTF with only 「古詩源」 for app-icon ImageResponse.
 * Full Regular TTF (~25MB) is too large for Satori and falls back silently.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";
import {
  computeInputFingerprint,
  isCacheHit,
  readCacheManifest,
  writeCacheManifest,
} from "./lib/generation-cache";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_SOURCE = path.join(ROOT, "scripts/fonts/LXGWWenKai-Regular.ttf");
const FONT_SOURCE_URL =
  "https://github.com/lxgw/LxgwWenKai/releases/download/v1.521/LXGWWenKai-Regular.ttf";
const OUT = path.join(ROOT, "scripts/.cache/wenkai-icon-title.ttf");
const MANIFEST_OUT = path.join(ROOT, "scripts/.cache/wenkai-icon.manifest.json");
const GENERATOR_VERSION = "1";
const TITLE = "古詩源";

async function ensureSourceFont(): Promise<void> {
  if (fs.existsSync(FONT_SOURCE)) {
    return;
  }

  fs.mkdirSync(path.dirname(FONT_SOURCE), { recursive: true });
  console.log(`Downloading LXGW WenKai Regular from ${FONT_SOURCE_URL}…`);
  const response = await fetch(FONT_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download source font (${response.status})`);
  }
  fs.writeFileSync(FONT_SOURCE, Buffer.from(await response.arrayBuffer()));
}

function recordedOutputBytes(): number | undefined {
  const manifest = readCacheManifest(MANIFEST_OUT);
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest)
  ) {
    return undefined;
  }
  const bytes = (manifest as { outputBytes?: unknown }).outputBytes;
  return typeof bytes === "number" ? bytes : undefined;
}

async function main() {
  await ensureSourceFont();

  const inputsHash = computeInputFingerprint({
    root: ROOT,
    files: [
      "scripts/fonts/LXGWWenKai-Regular.ttf",
      "scripts/generate-icon-font.ts",
    ],
    version: GENERATOR_VERSION,
  });

  const outputBytes = recordedOutputBytes();
  if (
    outputBytes !== undefined &&
    isCacheHit({
      manifestPath: MANIFEST_OUT,
      inputsHash,
      generatorVersion: GENERATOR_VERSION,
      outputs: [{ path: OUT, bytes: outputBytes }],
    })
  ) {
    console.log("Skipping WenKai icon generation (cache hit)");
    return;
  }

  const source = fs.readFileSync(FONT_SOURCE);
  const subset = await subsetFont(source, TITLE, { targetFormat: "truetype" });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(subset));
  writeCacheManifest(MANIFEST_OUT, {
    inputsHash,
    generatorVersion: GENERATOR_VERSION,
    outputBytes: subset.byteLength,
  });
  console.log(
    `Generated ${path.relative(ROOT, OUT)}: ${(subset.byteLength / 1024).toFixed(1)} KiB for 「${TITLE}」.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
