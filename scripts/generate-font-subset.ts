import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";
import { collectSiteFontGlyphs } from "../src/lib/font-glyphs";
import { WENKAI_SUBSET_PATH } from "../src/lib/wenkai-font";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Regular(400) 为正文权威字重：Light(300) 在小字号下发虚，Regular 在桌面/移动一致。
// 子集源文件与 @font-face 声明字重对齐，消除字重不匹配造成的字形发虚。
const FONT_SOURCE = path.join(ROOT, "scripts/fonts/LXGWWenKai-Regular.ttf");
const FONT_SOURCE_URL =
  "https://github.com/lxgw/LxgwWenKai/releases/download/v1.521/LXGWWenKai-Regular.ttf";
const OUT_DIR = path.join(ROOT, "public/fonts/wenkai");
const FONT_OUT = path.join(OUT_DIR, path.basename(WENKAI_SUBSET_PATH));
const CSS_OUT = path.join(ROOT, "src/fonts/wenkai.css");
const MANIFEST_OUT = path.join(ROOT, "scripts/.cache/wenkai.manifest.json");

const MAX_FONT_BYTES = 300 * 1024;

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

function buildFontFaceCss(): string {
  // 不前置 local()：保证所有设备使用同一站点子集，避免本机霞鹜文楷
  // （可能为 Light/Regular/不同字重）劫持正文，导致桌面/移动字重不一致。
  return `@font-face {
  font-family: "LXGW WenKai";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${WENKAI_SUBSET_PATH}) format("woff2");
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
  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });

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
  fs.writeFileSync(CSS_OUT, buildFontFaceCss());

  const manifest = {
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
