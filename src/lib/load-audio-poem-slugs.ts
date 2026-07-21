"use client";

export const AUDIO_POEM_SLUGS_URL = "/audio-poem-slugs.json";

let audioPoemSlugsPromise: Promise<readonly string[]> | null = null;

function parseAudioPoemSlugs(payload: unknown): readonly string[] {
  if (
    !Array.isArray(payload) ||
    payload.some((slug) => typeof slug !== "string")
  ) {
    throw new Error("Invalid audio poem slugs artifact");
  }
  return payload;
}

export function loadAudioPoemSlugs(): Promise<readonly string[]> {
  if (audioPoemSlugsPromise) {
    return audioPoemSlugsPromise;
  }

  audioPoemSlugsPromise = fetch(AUDIO_POEM_SLUGS_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load audio poem slugs (${response.status})`);
      }
      return parseAudioPoemSlugs(await response.json());
    })
    .catch((error) => {
      audioPoemSlugsPromise = null;
      throw error;
    });

  return audioPoemSlugsPromise;
}
