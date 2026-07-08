import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";
import { collectSiteFontGlyphs } from "../src/lib/font-glyphs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_SOURCE = path.join(ROOT, "scripts/fonts/LXGWWenKai-Light.ttf");
const FONT_SOURCE_URL =
  "https://github.com/lxgw/LxgwWenKai/releases/download/v1.521/LXGWWenKai-Light.ttf";
const OUT_DIR = path.join(ROOT, "public/fonts/wenkai");
const FONT_OUT = path.join(OUT_DIR, "wenkai-subset.woff2");
const CSS_OUT = path.join(ROOT, "src/fonts/wenkai.css");
const MANIFEST_OUT = path.join(ROOT, "src/fonts/wenkai.manifest.json");

const MAX_FONT_BYTES = 300 * 1024;

async function ensureSourceFont(): Promise<void> {
  if (fs.existsSync(FONT_SOURCE)) {
    return;
  }

  fs.mkdirSync(path.dirname(FONT_SOURCE), { recursive: true });
  console.log(`Downloading LXGW WenKai Light from ${FONT_SOURCE_URL}…`);
  const response = await fetch(FONT_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download source font (${response.status})`);
  }

  fs.writeFileSync(FONT_SOURCE, Buffer.from(await response.arrayBuffer()));
}

function buildFontFaceCss(fileName: string): string {
  return `@font-face {
  font-family: "LXGW WenKai";
  font-style: normal;
  font-display: swap;
  font-weight: 300;
  src:
    local("LXGW WenKai"),
    local("LXGW Wenkai"),
    url(/fonts/wenkai/${fileName}) format("woff2");
}
`;
}

async function main(): Promise<void> {
  await ensureSourceFont();

  const glyphs = collectSiteFontGlyphs();
  const text = String.fromCodePoint(...glyphs);
  console.log(`Collected ${glyphs.length} unique glyphs for font subset.`);

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });

  const sourceFont = fs.readFileSync(FONT_SOURCE);
  const subset = await subsetFont(sourceFont, text, {
    targetFormat: "woff2",
  });

  if (subset.byteLength > MAX_FONT_BYTES) {
    throw new Error(
      `Subset font is ${(subset.byteLength / 1024).toFixed(1)} KiB, exceeding ${MAX_FONT_BYTES / 1024} KiB limit`,
    );
  }

  const fileName = path.basename(FONT_OUT);
  fs.writeFileSync(FONT_OUT, subset);
  fs.writeFileSync(CSS_OUT, buildFontFaceCss(fileName));

  const manifest = {
    generatedAt: new Date().toISOString(),
    glyphCount: glyphs.length,
    fontFile: fileName,
    bytes: subset.byteLength,
  };
  fs.writeFileSync(MANIFEST_OUT, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Generated ${fileName}: ${(subset.byteLength / 1024).toFixed(1)} KiB for ${glyphs.length} glyphs.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
