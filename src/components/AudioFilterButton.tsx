"use client";

import { Headphones } from "lucide-react";
import { useAudioFilter } from "@/components/AudioFilterProvider";
import { useUiText } from "@/components/ScriptVariantProvider";
import { cn } from "@/lib/utils";

export function AudioFilterButton() {
  const filterAudio = useUiText("filterAudio");
  const filterAudioActive = useUiText("filterAudioActive");
  const { audioOnly, toggle } = useAudioFilter();

  return (
    <button
      type="button"
      className={cn(
        "site-chrome__control site-chrome__control--icon",
        audioOnly && "site-chrome__control--active",
      )}
      onClick={toggle}
      aria-label={audioOnly ? filterAudioActive : filterAudio}
      aria-pressed={audioOnly}
      title={audioOnly ? filterAudioActive : filterAudio}
    >
      <Headphones aria-hidden="true" className="size-3.5" />
    </button>
  );
}
