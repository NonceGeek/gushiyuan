import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAllVolumes, getPoemBySlug, getPoemsByVolume } from "./poems";

const POEMS_DIR = path.join(process.cwd(), "content", "poems");
const MANIFEST_DIR = path.join(process.cwd(), "content", "volumes");
const ALLOWED_PUNCT = /^[\u4e00-\u9fff。、]+$/;

function getVolumeManifests(): { volumeSlug: string; slugs: string[] }[] {
  const volumes = getAllVolumes();
  return volumes
    .map((volume) => {
      const manifestPath = path.join(
        MANIFEST_DIR,
        `${volume.slug}-manifest.json`,
      );
      if (!fs.existsSync(manifestPath)) {
        return null;
      }
      const slugs = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as string[];
      return { volumeSlug: volume.slug, slugs };
    })
    .filter((entry): entry is { volumeSlug: string; slugs: string[] } =>
      Boolean(entry),
    );
}

function readVolumePoemFiles(volumeSlug: string) {
  const slugs = getPoemsByVolume(volumeSlug).map((p) => p.slug);
  return slugs.map((slug) => {
    const raw = fs.readFileSync(path.join(POEMS_DIR, `${slug}.md`), "utf-8");
    const { data, content } = matter(raw);
    return { slug, data, body: content.trim() };
  });
}

function parseChapters(body: string): string[][] {
  return body.split(/\n\n+/).map((chapter) =>
    chapter.split("\n").filter((line) => line.trim() !== ""),
  );
}

describe("imported volume content invariants", () => {
  const manifests = getVolumeManifests();

  it("has at least one imported volume manifest", () => {
    expect(manifests.length).toBeGreaterThanOrEqual(1);
  });

  for (const { volumeSlug, slugs } of manifests) {
    describe(`${volumeSlug} volume`, () => {
      const poems = readVolumePoemFiles(volumeSlug);

      it(`has ${slugs.length} poems matching manifest`, () => {
        expect(poems).toHaveLength(slugs.length);
        expect(poems.map((p) => p.slug)).toEqual(slugs);
      });

      it("omits base from frontmatter", () => {
        for (const { slug, data } of poems) {
          expect(data.base, `${slug} should not have base field`).toBeUndefined();
        }
      });

      it("uses only period and顿号 punctuation in body lines", () => {
        for (const { slug, body } of poems) {
          for (const line of body.split("\n")) {
            if (!line.trim()) {
              continue;
            }
            expect(ALLOWED_PUNCT.test(line), `${slug}: ${line}`).toBe(true);
          }
        }
      });

      it("ends every body line with a period", () => {
        for (const { slug, body } of poems) {
          for (const line of body.split("\n")) {
            if (!line.trim()) {
              continue;
            }
            expect(line.endsWith("。"), `${slug}: ${line}`).toBe(true);
          }
        }
      });
    });
  }
});

describe("gu-yi spot checks", () => {
  it("击壤歌 has five lines", () => {
    const poem = getPoemBySlug("ji-rang-ge");
    expect(poem?.body.split("\n")).toHaveLength(5);
  });

  it("卿云歌 has four lines", () => {
    const poem = getPoemBySlug("qing-yun-ge");
    expect(poem?.body.split("\n")).toHaveLength(4);
  });

  it("孔子诵 has two chapters of four lines each", () => {
    const poem = getPoemBySlug("kong-zi-song");
    expect(poem).toBeDefined();
    const chapters = parseChapters(poem!.body);
    expect(chapters).toHaveLength(2);
    expect(chapters[0]).toHaveLength(4);
    expect(chapters[1]).toHaveLength(4);
  });

  it("水仙操 has four lines and no preface pollution", () => {
    const poem = getPoemBySlug("shui-xian-cao");
    expect(poem?.body.split("\n")).toHaveLength(4);
    expect(poem?.body).not.toMatch(/琴苑要录/);
    expect(poem?.body).not.toMatch(/[，：""]/);
  });

  it("杖铭 retains internal顿号", () => {
    const poem = getPoemBySlug("zhang-ming");
    expect(poem?.body).toContain("、");
  });

  it("越人歌 retains internal顿号", () => {
    const poem = getPoemBySlug("yue-ren-ge");
    expect(poem?.body).toContain("、");
  });
});

describe("han volume spot checks", () => {
  it("大风歌 has three lines in one chapter", () => {
    const poem = getPoemBySlug("da-feng-ge");
    expect(poem).toBeDefined();
    expect(poem?.volume).toBe("han");
    const chapters = parseChapters(poem!.body);
    expect(chapters).toHaveLength(1);
    expect(chapters[0]).toHaveLength(3);
  });

  it("安世房中歌 has sixteen chapters", () => {
    const poem = getPoemBySlug("an-shi-fang-zhong-ge");
    expect(poem).toBeDefined();
    expect(parseChapters(poem!.body)).toHaveLength(16);
  });

  it("行行重行行 has sixteen lines and restored slug", () => {
    const poem = getPoemBySlug("xing-xing-chong-xing-xing");
    expect(poem).toBeDefined();
    expect(poem?.title).toBe("行行重行行");
    expect(poem?.author).toBe("古诗十九首");
    expect(poem?.body.split("\n")).toHaveLength(16);
  });

  it("reuses pre-#29 slugs for restored Han poems", () => {
    for (const slug of [
      "chang-ge-xing",
      "mo-shang-sang",
      "shang-xie",
      "qing-qing-he-pan-cao",
      "she-jiang-cai-fu-rong",
      "xi-bei-you-gao-lou",
    ]) {
      expect(getPoemBySlug(slug)?.volume).toBe("han");
    }
  });
});
