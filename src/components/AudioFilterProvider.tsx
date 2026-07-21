"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AudioFilterMode } from "@/lib/audio-filter";
import {
  getAudioFilterServerSnapshot,
  getAudioFilterSnapshot,
  hydrateAudioFilterFromStorage,
  setAudioFilterMode,
  subscribeAudioFilter,
  toggleAudioFilterMode,
} from "@/lib/audio-filter-client";

type AudioFilterContextValue = {
  mode: AudioFilterMode;
  audioOnly: boolean;
  setMode: (mode: AudioFilterMode) => void;
  toggle: () => void;
};

const AudioFilterContext = createContext<AudioFilterContextValue | null>(null);

export function AudioFilterProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeAudioFilter,
    getAudioFilterSnapshot,
    getAudioFilterServerSnapshot,
  );

  useEffect(() => {
    hydrateAudioFilterFromStorage();
  }, []);

  const value = useMemo<AudioFilterContextValue>(
    () => ({
      mode,
      audioOnly: mode === "audio-only",
      setMode: setAudioFilterMode,
      toggle: toggleAudioFilterMode,
    }),
    [mode],
  );

  return (
    <AudioFilterContext.Provider value={value}>
      {children}
    </AudioFilterContext.Provider>
  );
}

export function useAudioFilter(): AudioFilterContextValue {
  const ctx = useContext(AudioFilterContext);
  if (!ctx) {
    throw new Error("useAudioFilter must be used within AudioFilterProvider");
  }
  return ctx;
}
