/**
 * Import 古逸卷 103 poems from 中华书局《古诗源》epub.
 *
 * Usage: node scripts/import-gu-yi-from-epub.mjs <path-to.epub>
 *
 * Overwrites content/poems/*.md (gu-yi only) and content/volumes/gu-yi-manifest.json.
 * Slugs and manifest order are preserved; poem text is simplified with period punctuation.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { GU_YI_METADATA } from "./gu-yi-metadata.mjs";
import {
  extractTitleFromHeading,
  formatBody,
  processPoemBlocks,
  renderPoemMarkdown,
  stripPoemHtml,
} from "./epub-poem-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const POEMS_DIR = path.join(ROOT, "content", "poems");
const MANIFEST_PATH = path.join(ROOT, "content", "volumes", "gu-yi-manifest.json");
const EPUB_HTML_PATH = "text/part0007.html";

const DYNASTY = "古逸";
const VOLUME = "gu-yi";
const EXPECTED_COUNT = 103;

export { extractTitleFromHeading as extractTitleFromH3 };
export {
  formatBody,
  processPoemBlocks,
  renderPoemMarkdown,
};

export { stripPoemHtml };
export {
  isPollutedParagraph,
  splitIntoLines,
  validateLinePunctuation,
} from "./epub-poem-utils.mjs";

/**
 * @param {string} html
 * @returns {Array<{ title: string, chapters: string[][] }>}
 */
export function parseGuYiEntries(html) {
  const h3Pattern =
    /<h3 class="kindle-cn-heading3"[^>]*>([\s\S]*?)<\/h3>/gi;
  const matches = [...html.matchAll(h3Pattern)];

  const rejected = [];
  const entries = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const title = extractTitleFromHeading(match[0]);
    const sectionStart = match.index + match[0].length;
    const sectionEnd =
      i + 1 < matches.length ? matches[i + 1].index : html.length;
    const section = html.slice(sectionStart, sectionEnd);

    const poemPattern =
      /<p class="kindle-cn-poem-left">([\s\S]*?)<\/p>/gi;
    const poemBlocks = [...section.matchAll(poemPattern)].map((block) => block[1]);

    const chapters = processPoemBlocks(poemBlocks, {
      title,
      onReject: (item) => rejected.push(item),
    });

    entries.push({ title, chapters });
  }

  return { entries, rejected };
}

/**
 * @param {string} epubPath
 */
export function readEpubHtml(epubPath) {
  return execSync(`unzip -p ${JSON.stringify(epubPath)} ${EPUB_HTML_PATH}`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

/**
 * @param {string} epubPath
 */
export function importGuYiFromEpub(epubPath) {
  if (GU_YI_METADATA.length !== EXPECTED_COUNT) {
    throw new Error(
      `Metadata count ${GU_YI_METADATA.length} !== ${EXPECTED_COUNT}`,
    );
  }

  const html = readEpubHtml(epubPath);
  const { entries, rejected } = parseGuYiEntries(html);

  if (entries.length !== EXPECTED_COUNT) {
    throw new Error(
      `Extracted ${entries.length} entries from epub, expected ${EXPECTED_COUNT}`,
    );
  }

  const manifest = GU_YI_METADATA.map((meta) => meta.slug);
  const logLines = [];

  for (let i = 0; i < EXPECTED_COUNT; i++) {
    const meta = GU_YI_METADATA[i];
    const entry = entries[i];
    const body = formatBody(entry.chapters);

    fs.writeFileSync(
      path.join(POEMS_DIR, `${meta.slug}.md`),
      renderPoemMarkdown({
        title: entry.title,
        author: meta.author,
        authorSlug: meta.authorSlug,
        dynasty: DYNASTY,
        volume: VOLUME,
        body,
      }),
    );

    logLines.push(`${meta.slug}\t${entry.title}`);
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  return { count: EXPECTED_COUNT, rejected, logLines };
}

function main() {
  const epubPath = process.argv[2];
  if (!epubPath) {
    console.error("Usage: node scripts/import-gu-yi-from-epub.mjs <path-to.epub>");
    process.exit(1);
  }

  if (!fs.existsSync(epubPath)) {
    console.error(`Epub not found: ${epubPath}`);
    process.exit(1);
  }

  const { count, rejected, logLines } = importGuYiFromEpub(epubPath);

  console.log(`Imported ${count} gu-yi poems.`);
  console.log("\nSlug ↔ title:");
  for (const line of logLines) {
    console.log(`  ${line}`);
  }

  if (rejected.length > 0) {
    console.log("\nRejected paragraphs (pollution guard):");
    for (const item of rejected) {
      console.log(`  [${item.title}] ${item.text}`);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
