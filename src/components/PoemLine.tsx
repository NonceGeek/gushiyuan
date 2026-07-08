"use client";

import type { Character } from "@/lib/character-types";
import { CharacterEvolutionPopover } from "@/components/CharacterEvolutionPopover";

type PoemLineProps = {
  line: string;
  lineIndex: number;
  keyCharacters: Record<string, Character>;
};

export function PoemLine({ line, lineIndex, keyCharacters }: PoemLineProps) {
  const chars = [...line];

  return (
    <p className="poem-reader__line">
      {chars.map((char, charIndex) => {
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
      })}
    </p>
  );
}
