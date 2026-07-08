import { describe, expect, it } from "vitest";
import {
  getAllCharacters,
  getCharacterByChar,
  getCharactersByChars,
} from "./characters";

describe("getCharacterByChar", () => {
  it("returns glyph stages, meaning, and source for a known character", () => {
    const character = getCharacterByChar("月");

    expect(character).toBeDefined();
    expect(character?.char).toBe("月");
    expect(character?.meaning).toMatch(/月|弯|形/);
    expect(character?.source).toMatch(/汉典|象形字典/);
    expect(character?.stages.regular).toBeDefined();
    expect(character?.stages.regular?.image).toMatch(/^\/characters\//);
  });

  it("allows missing ancient stages", () => {
    const character = getCharacterByChar("月");

    expect(character?.stages.regular).toBeDefined();
    const stageCount = Object.keys(character?.stages ?? {}).length;
    expect(stageCount).toBeGreaterThanOrEqual(1);
  });

  it("returns undefined for an unknown character", () => {
    expect(getCharacterByChar("龘")).toBeUndefined();
  });
});

describe("getCharactersByChars", () => {
  it("returns matching characters and deduplicates input", () => {
    const characters = getCharactersByChars(["月", "月", "心"]);

    expect(characters.map((c) => c.char)).toEqual(["月", "心"]);
  });
});

describe("getAllCharacters", () => {
  it("lists every character entry", () => {
    const characters = getAllCharacters();

    expect(characters.length).toBeGreaterThanOrEqual(1);
    expect(characters.some((c) => c.char === "月")).toBe(true);
    expect(characters.every((c) => c.char && c.meaning && c.source)).toBe(true);
  });
});
