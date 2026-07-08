"use client";

import type { Character } from "@/lib/character-types";
import type { LineageClue } from "@/lib/lineage-types";
import { CharacterEvolutionPopover } from "@/components/CharacterEvolutionPopover";
import { LineageHint } from "@/components/LineageHint";

type PoemLineProps = {
  line: string;
  lineIndex: number;
  keyCharacters: Record<string, Character>;
  lineageClue?: LineageClue;
};

function renderLineChars(
  line: string,
  lineIndex: number,
  keyCharacters: Record<string, Character>,
) {
  return [...line].map((char, charIndex) => {
    const character = keyCharacters[char];
    if (character) {
      return (
        <CharacterEvolutionPopover
          key={`${lineIndex}-${charIndex}-${char}`}
          character={character}
        />
      );
    }

    return (
      <span key={`${lineIndex}-${charIndex}-${char}`} className="poem-reader__char">
        {char}
      </span>
    );
  });
}

export function PoemLine({
  line,
  lineIndex,
  keyCharacters,
  lineageClue,
}: PoemLineProps) {
  const chars = renderLineChars(line, lineIndex, keyCharacters);

  if (lineageClue) {
    return (
      <LineageHint clue={lineageClue} lineIndex={lineIndex}>
        {chars}
      </LineageHint>
    );
  }

  return (
    <p id={`line-${lineIndex}`} className="poem-reader__line">
      {chars}
    </p>
  );
}
