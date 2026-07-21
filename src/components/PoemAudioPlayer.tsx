"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useUiText } from "@/components/ScriptVariantProvider";
import {
  poemAudioSrc,
  type PoemAudioTrack,
} from "@/lib/poem-audio";

type PoemAudioPlayerProps = {
  tracks: PoemAudioTrack[];
};

export function PoemAudioPlayer({ tracks }: PoemAudioPlayerProps) {
  const ariaLabel = useUiText("poemAudioAria");
  const playLabel = useUiText("playAudio");
  const pauseLabel = useUiText("pauseAudio");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const baseId = useId();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onEnded = () => {
      setPlaying(false);
      setActiveIndex(null);
    };
    const onPause = () => {
      setPlaying(false);
    };
    const onPlay = () => {
      setPlaying(true);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (tracks.length === 0) {
    return null;
  }

  async function toggleTrack(index: number) {
    const audio = audioRef.current;
    const track = tracks[index];
    if (!audio || !track) {
      return;
    }

    if (activeIndex === index && playing) {
      audio.pause();
      return;
    }

    const src = poemAudioSrc(track);
    if (audio.getAttribute("src") !== src) {
      audio.src = src;
    }
    setActiveIndex(index);
    try {
      await audio.play();
    } catch {
      setPlaying(false);
      setActiveIndex(null);
    }
  }

  return (
    <div className="poem-audio" role="group" aria-label={ariaLabel}>
      <audio ref={audioRef} preload="none" />
      {tracks.map((track, index) => {
        const isActive = activeIndex === index && playing;
        const label = isActive ? pauseLabel : playLabel;
        return (
          <button
            key={`${track.fileName}-${track.lang}-${track.author}`}
            id={`${baseId}-${index}`}
            type="button"
            className="poem-audio__track"
            aria-label={`${label}，${track.lang}，${track.author}`}
            aria-pressed={isActive}
            onClick={() => {
              void toggleTrack(index);
            }}
          >
            <span className="poem-audio__icon" aria-hidden="true">
              {isActive ? (
                <Pause className="size-3.5" fill="currentColor" />
              ) : (
                <Play className="size-3.5" fill="currentColor" />
              )}
            </span>
            <span className="poem-audio__lang">{track.lang}</span>
            <span className="poem-audio__author">{track.author}</span>
          </button>
        );
      })}
    </div>
  );
}
