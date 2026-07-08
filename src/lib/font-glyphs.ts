import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SOURCE_ROOT = path.join(process.cwd(), "src");

/** UI 与排版常用标点，竖排悬挂与检索面板也需要。 */
export const FONT_GLYPH_FALLBACK =
  " \t\n\r" +
  "0123456789" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
  "，。、；：？！「」『』《》（）…—·\u201c\u201d\u2018\u2019\u3000" +
  "←→↑↓↔↕" +
  "⌘CtrlK";

export function extractCodePoints(text: string): number[] {
  const codePoints: number[] = [];
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      codePoints.push(codePoint);
    }
  }
  return codePoints;
}

export function uniqueSortedCodePoints(codePoints: Iterable<number>): number[] {
  return [...new Set(codePoints)].sort((a, b) => a - b);
}

function walkFiles(root: string, extensions: string[]): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files: string[] = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (
        extensions.some((ext) => entry.name.endsWith(ext)) &&
        !entry.name.includes(".test.")
      ) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

export function collectSiteFontGlyphs(options?: {
  contentRoot?: string;
  sourceRoot?: string;
}): number[] {
  const contentRoot = options?.contentRoot ?? CONTENT_ROOT;
  const sourceRoot = options?.sourceRoot ?? SOURCE_ROOT;

  const codePoints: number[] = [
    ...extractCodePoints(FONT_GLYPH_FALLBACK),
  ];

  for (const file of walkFiles(contentRoot, [".md", ".json"])) {
    codePoints.push(...extractCodePoints(fs.readFileSync(file, "utf8")));
  }

  for (const file of walkFiles(sourceRoot, [".ts", ".tsx"])) {
    codePoints.push(...extractCodePoints(fs.readFileSync(file, "utf8")));
  }

  return uniqueSortedCodePoints(codePoints);
}
