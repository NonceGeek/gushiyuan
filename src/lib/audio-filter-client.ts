"use client";

import {
  readPersistedAudioFilterMode,
  writePersistedAudioFilterMode,
  type AudioFilterMode,
} from "@/lib/audio-filter";

let mode: AudioFilterMode = "all";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAudioFilter(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAudioFilterSnapshot(): AudioFilterMode {
  return mode;
}

export function getAudioFilterServerSnapshot(): AudioFilterMode {
  return "all";
}

export function hydrateAudioFilterFromStorage(): void {
  const next = readPersistedAudioFilterMode(
    typeof localStorage === "undefined" ? null : localStorage,
  );
  if (next !== mode) {
    mode = next;
    emit();
  }
}

export function setAudioFilterMode(next: AudioFilterMode): void {
  if (next === mode) {
    return;
  }
  mode = next;
  writePersistedAudioFilterMode(
    typeof localStorage === "undefined" ? null : localStorage,
    next,
  );
  emit();
}

export function toggleAudioFilterMode(): void {
  setAudioFilterMode(mode === "audio-only" ? "all" : "audio-only");
}
