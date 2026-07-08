import fs from "fs";
import path from "path";
import type { LineageClue, StreamRef } from "./lineage-types";

const CLUES_FILE = path.join(process.cwd(), "content/lineage/clues.json");

let cachedClues: LineageClue[] | null = null;

function loadClues(): LineageClue[] {
  if (cachedClues) {
    return cachedClues;
  }

  const raw = fs.readFileSync(CLUES_FILE, "utf-8");
  cachedClues = JSON.parse(raw) as LineageClue[];
  return cachedClues;
}

export type LineageByLine = Map<number, LineageClue>;

export function getLineageForPoem(poemSlug: string): LineageByLine {
  const map = new Map<number, LineageClue>();

  for (const clue of loadClues()) {
    if (clue.source.poemSlug === poemSlug) {
      map.set(clue.source.lineIndex, clue);
    }
  }

  return map;
}

export function getAllStreamIds(): string[] {
  const ids: string[] = [];

  for (const clue of loadClues()) {
    for (const stream of clue.streams) {
      ids.push(stream.id);
    }
  }

  return ids;
}

export type StreamContext = {
  stream: StreamRef;
  clue: LineageClue;
};

export function getStreamContext(streamId: string): StreamContext | undefined {
  for (const clue of loadClues()) {
    const stream = clue.streams.find((item) => item.id === streamId);
    if (stream) {
      return { stream, clue };
    }
  }

  return undefined;
}

export function getSourcePoemSlugsWithLineage(): string[] {
  const slugs = new Set<string>();

  for (const clue of loadClues()) {
    slugs.add(clue.source.poemSlug);
  }

  return [...slugs].sort((a, b) => a.localeCompare(b, "zh-CN"));
}
