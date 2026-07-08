import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectSiteFontGlyphs,
  extractCodePoints,
  FONT_GLYPH_FALLBACK,
  uniqueSortedCodePoints,
} from "@/lib/font-glyphs";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function makeTempContent(content: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "font-glyphs-"));
  tempDirs.push(dir);

  for (const [relativePath, body] of Object.entries(content)) {
    const filePath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, body, "utf8");
  }

  return dir;
}

describe("extractCodePoints", () => {
  it("extracts supplementary-plane code points", () => {
    expect(extractCodePoints("𠮷")).toEqual([0x20bb7]);
  });

  it("deduplicates with uniqueSortedCodePoints", () => {
    expect(uniqueSortedCodePoints([67, 65, 66, 65])).toEqual([65, 66, 67]);
  });
});

describe("collectSiteFontGlyphs", () => {
  it("includes fallback punctuation and UI glyphs", () => {
    const glyphs = collectSiteFontGlyphs();
    for (const char of ["，", "。", "「", "」", "…", "源", "诗"]) {
      expect(glyphs).toContain(char.codePointAt(0));
    }
    expect(glyphs).toContain("K".codePointAt(0));
  });

  it("collects characters from content and source trees", () => {
    const contentRoot = makeTempContent({
      "poems/test.md": "关关雎鸠",
      "characters/x.json": '{"char":"雎","meaning":"鸟名"}',
    });
    const sourceRoot = makeTempContent({
      "components/Example.tsx": "检索面板",
    });

    const glyphs = collectSiteFontGlyphs({ contentRoot, sourceRoot });
    for (const char of "关关雎鸠雎鸟名检索面板") {
      expect(glyphs).toContain(char.codePointAt(0));
    }
  });

  it("includes common punctuation from FONT_GLYPH_FALLBACK", () => {
    for (const char of FONT_GLYPH_FALLBACK) {
      expect(collectSiteFontGlyphs()).toContain(char.codePointAt(0));
    }
  });
});
