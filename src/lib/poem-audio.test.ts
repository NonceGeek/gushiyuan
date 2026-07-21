import { describe, expect, it } from "vitest";
import {
  parsePoemAudio,
  poemAudioSrc,
  type PoemAudioTrack,
} from "./poem-audio";
import { getPoemBySlug } from "./poems";

describe("parsePoemAudio", () => {
  it("returns undefined when audio is absent", () => {
    expect(parsePoemAudio(undefined, "x")).toBeUndefined();
    expect(parsePoemAudio(null, "x")).toBeUndefined();
    expect(parsePoemAudio("", "x")).toBeUndefined();
    expect(parsePoemAudio([], "x")).toBeUndefined();
  });

  it("parses a JSON track array", () => {
    expect(
      parsePoemAudio(
        [{ file_name: "jing-ye-si.mp3", author: "郭浚森", lang: "粤" }],
        "jing-ye-si",
      ),
    ).toEqual([
      { fileName: "jing-ye-si.mp3", author: "郭浚森", lang: "粤" },
    ]);
  });

  it("rejects non-array and incomplete tracks", () => {
    expect(() => parsePoemAudio({ file_name: "a.mp3" }, "x")).toThrow(/array/);
    expect(() =>
      parsePoemAudio([{ author: "郭浚森", lang: "粤" }], "x"),
    ).toThrow(/file_name/);
  });
});

describe("poemAudioSrc", () => {
  it("maps fileName to /audios/…", () => {
    const track: PoemAudioTrack = {
      fileName: "jing-ye-si.mp3",
      author: "郭浚森",
      lang: "粤",
    };
    expect(poemAudioSrc(track)).toBe("/audios/jing-ye-si.mp3");
  });
});

describe("poem audio frontmatter", () => {
  it("loads jing-ye-si audio tracks", () => {
    const poem = getPoemBySlug("jing-ye-si");
    expect(poem?.audio).toEqual([
      { fileName: "jing-ye-si.mp3", author: "郭浚森", lang: "粤" },
    ]);
  });

  it("omits audio on poems without the field", () => {
    expect(getPoemBySlug("ji-rang-ge")?.audio).toBeUndefined();
  });
});
