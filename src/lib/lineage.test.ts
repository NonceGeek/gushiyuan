import { describe, expect, it } from "vitest";
import { getPoemBySlug } from "./poems";
import {
  getAllStreamIds,
  getLineageForPoem,
  getSourcePoemSlugsWithLineage,
  getStreamContext,
} from "./lineage";

describe("getLineageForPoem", () => {
  it("returns clues keyed by line index for a poem with lineage", () => {
    const lineage = getLineageForPoem("duan-ge-xing");

    expect(lineage.get(12)?.id).toBe("yue-ming-xing-xi");
    expect(lineage.get(12)?.streams.length).toBeGreaterThan(0);
  });

  it("returns an empty map for poems without lineage", () => {
    expect(getLineageForPoem("mo-shang-sang").size).toBe(0);
  });

  it("maps each clue to the matching source line text", () => {
    const poem = getPoemBySlug("duan-ge-xing");
    const lines = poem!.body.split("\n").filter(Boolean);
    const lineage = getLineageForPoem("duan-ge-xing");

    for (const [lineIndex, clue] of lineage) {
      expect(lines[lineIndex]).toBeDefined();
      expect(clue.source.poemSlug).toBe("duan-ge-xing");
      expect(clue.source.lineIndex).toBe(lineIndex);
    }
  });

  it("maps ri-yue-zhi-xing to the line about sun and moon", () => {
    const poem = getPoemBySlug("guan-cang-hai");
    const lines = poem!.body.split("\n").filter(Boolean);
    const lineage = getLineageForPoem("guan-cang-hai");

    expect(lineage.get(4)?.id).toBe("ri-yue-zhi-xing");
    expect(lines[4]).toContain("日月之行");
  });
});

describe("getStreamContext", () => {
  it("returns stream and source clue for a known stream id", () => {
    const context = getStreamContext("chi-bi-fu-yue-ming");

    expect(context).toBeDefined();
    expect(context?.stream.author).toBe("苏轼");
    expect(context?.stream.source).toMatch(/^《.+》/);
    expect(context?.clue.source.poemSlug).toBe("duan-ge-xing");
  });

  it("returns undefined for an unknown stream id", () => {
    expect(getStreamContext("not-a-stream")).toBeUndefined();
  });
});

describe("getAllStreamIds", () => {
  it("lists every stream id exactly once", () => {
    const ids = getAllStreamIds();

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getSourcePoemSlugsWithLineage", () => {
  it("covers at least ten distinct source poems", () => {
    const slugs = getSourcePoemSlugsWithLineage();

    expect(slugs.length).toBeGreaterThanOrEqual(10);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("lineage data quality", () => {
  it("gives every stream a citable source reference", () => {
    const slugs = getSourcePoemSlugsWithLineage();

    for (const slug of slugs) {
      for (const clue of getLineageForPoem(slug).values()) {
        for (const stream of clue.streams) {
          expect(stream.source.length).toBeGreaterThan(0);
          expect(stream.source).toMatch(/^《.+》/);
        }
      }
    }
  });
});
