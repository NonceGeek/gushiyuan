import { describe, expect, it } from "vitest";
import {
  getAllPoems,
  getAllVolumes,
  getAuthorsByVolume,
  getPoemBySlug,
  getPoemsByAuthor,
  getVolumeBySlug,
} from "./poems";

describe("getPoemBySlug", () => {
  it("returns poem metadata and body for a known slug", () => {
    const poem = getPoemBySlug("duan-ge-xing");

    expect(poem).toBeDefined();
    expect(poem?.title).toBe("短歌行");
    expect(poem?.author).toBe("曹操");
    expect(poem?.authorSlug).toBe("cao-cao");
    expect(poem?.dynasty).toBe("魏");
    expect(poem?.volume).toBe("wei");
    expect(poem?.body).toContain("对酒当歌，人生几何！");
    expect(poem?.body).toContain("周公吐哺，天下归心。");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPoemBySlug("not-a-poem")).toBeUndefined();
  });
});

describe("getAllPoems", () => {
  it("lists every poem with slug and metadata", () => {
    const poems = getAllPoems();

    expect(poems.length).toBeGreaterThanOrEqual(1);
    expect(poems.some((p) => p.slug === "duan-ge-xing")).toBe(true);
    expect(
      poems.every(
        (p) => p.title && p.author && p.authorSlug && p.dynasty && p.volume,
      ),
    ).toBe(true);
  });
});

describe("getAllVolumes", () => {
  it("returns volumes in catalog order", () => {
    const volumes = getAllVolumes();

    expect(volumes.map((v) => v.slug)).toEqual([
      "xian-qin",
      "han",
      "wei",
      "jin",
      "nan-bei",
      "sui",
    ]);
    expect(volumes[0]?.name).toBe("先秦");
  });
});

describe("getVolumeBySlug", () => {
  it("returns a volume by slug", () => {
    expect(getVolumeBySlug("han")?.name).toBe("汉");
  });

  it("returns undefined for unknown slug", () => {
    expect(getVolumeBySlug("unknown")).toBeUndefined();
  });
});

describe("getAuthorsByVolume", () => {
  it("lists distinct authors in a volume", () => {
    const authors = getAuthorsByVolume("han");

    expect(authors.some((a) => a.slug === "gu-shi-shi-jiu-shou")).toBe(true);
    expect(authors.some((a) => a.slug === "han-yue-fu")).toBe(true);
    expect(authors.every((a) => a.slug && a.name)).toBe(true);
  });
});

describe("getPoemsByAuthor", () => {
  it("lists poems for an author within a volume", () => {
    const poems = getPoemsByAuthor("wei", "cao-cao");

    expect(poems.some((p) => p.slug === "duan-ge-xing")).toBe(true);
    expect(poems.every((p) => p.volume === "wei" && p.authorSlug === "cao-cao")).toBe(
      true,
    );
  });
});
