export const AUDIO_FILTER_STORAGE_KEY = "gushiyuan-audio-filter";

export type AudioFilterMode = "all" | "audio-only";

export function isAudioFilterMode(value: unknown): value is AudioFilterMode {
  return value === "all" || value === "audio-only";
}

export function readPersistedAudioFilterMode(
  storage: Pick<Storage, "getItem"> | null | undefined,
): AudioFilterMode {
  if (!storage) {
    return "all";
  }
  try {
    const value = storage.getItem(AUDIO_FILTER_STORAGE_KEY);
    return isAudioFilterMode(value) ? value : "all";
  } catch {
    return "all";
  }
}

export function writePersistedAudioFilterMode(
  storage: Pick<Storage, "setItem"> | null | undefined,
  mode: AudioFilterMode,
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(AUDIO_FILTER_STORAGE_KEY, mode);
  } catch {
    // Ignore quota / private-mode failures.
  }
}
