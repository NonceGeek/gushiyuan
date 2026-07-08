import fs from "fs";
import path from "path";
import {
  type Character,
  type GlyphStage,
  GLYPH_STAGE_LABELS,
} from "@/lib/character-types";

export type { Character, GlyphStage, GlyphStageData } from "@/lib/character-types";
export { GLYPH_STAGE_ORDER } from "@/lib/character-types";

const CHARACTERS_DIR = path.join(process.cwd(), "content", "characters");

let characterIndex: Map<string, Character> | null = null;

function loadCharacterIndex(): Map<string, Character> {
  if (characterIndex) {
    return characterIndex;
  }

  characterIndex = new Map();
  const files = fs.readdirSync(CHARACTERS_DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const character = parseCharacterFile(path.join(CHARACTERS_DIR, file));
    characterIndex.set(character.char, character);
  }

  return characterIndex;
}

function parseCharacterFile(filePath: string): Character {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as {
    char: string;
    meaning: string;
    source: string;
    stages: Partial<
      Record<
        GlyphStage,
        {
          label?: string;
          image: string;
        }
      >
    >;
  };

  if (!data.char || !data.meaning || !data.source) {
    throw new Error(`Character file "${filePath}" is missing required fields`);
  }

  const stages: Character["stages"] = {};
  for (const [stage, stageData] of Object.entries(data.stages ?? {})) {
    if (!stageData?.image) continue;
    stages[stage as GlyphStage] = {
      label: stageData.label ?? GLYPH_STAGE_LABELS[stage as GlyphStage],
      image: stageData.image,
    };
  }

  return {
    char: data.char,
    meaning: data.meaning,
    source: data.source,
    stages,
  };
}

export function getCharacterByChar(char: string): Character | undefined {
  return loadCharacterIndex().get(char);
}

export function getCharactersByChars(chars: string[]): Character[] {
  const index = loadCharacterIndex();
  const unique = [...new Set(chars)];

  return unique
    .map((char) => index.get(char))
    .filter((character): character is Character => character !== undefined);
}

export function getKeyCharacterMap(chars: string[]): Record<string, Character> {
  return Object.fromEntries(
    getCharactersByChars(chars).map((character) => [character.char, character]),
  );
}

export function getAllCharacters(): Character[] {
  return [...loadCharacterIndex().values()].sort((a, b) =>
    a.char.localeCompare(b.char, "zh-CN"),
  );
}
