export type PoemAudioTrack = {
  fileName: string;
  author: string;
  lang: string;
};

export function poemAudioSrc(track: PoemAudioTrack): string {
  return `/audios/${track.fileName}`;
}

function requireAudioString(
  record: Record<string, unknown>,
  key: string,
  slug: string,
  index: number,
): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Poem "${slug}" audio[${index}] is missing required string field "${key}"`,
    );
  }
  return value.trim();
}

/**
 * Parse optional frontmatter `audio` (JSON array of tracks).
 * Absent / null / empty → undefined (no player).
 */
export function parsePoemAudio(
  value: unknown,
  slug: string,
): PoemAudioTrack[] | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(
      `Poem "${slug}" audio must be a JSON array of tracks`,
    );
  }

  if (value.length === 0) {
    return undefined;
  }

  return value.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new Error(
        `Poem "${slug}" audio[${index}] must be an object`,
      );
    }
    const record = entry as Record<string, unknown>;
    return {
      fileName: requireAudioString(record, "file_name", slug, index),
      author: requireAudioString(record, "author", slug, index),
      lang: requireAudioString(record, "lang", slug, index),
    };
  });
}
