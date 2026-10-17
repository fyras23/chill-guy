"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import type { RepeatMode } from "@/lib/audio/types";

interface KeysProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  disabled?: boolean;
  onTogglePlay: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export function Keys({
  isPlaying,
  shuffle,
  repeat,
  disabled = false,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
}: KeysProps) {
  return (
    <div
      role="toolbar"
      aria-label="Audio playback controls"
      className="flex items-center justify-center gap-3 sm:gap-4 select-none flex-wrap"
    >
      {/* Shuffle Key */}
      <button
        type="button"
        title={shuffle ? "Shuffle on" : "Shuffle off"}
        aria-label={shuffle ? "Shuffle on" : "Shuffle off"}
        aria-pressed={shuffle}
        disabled={disabled}
        onClick={onToggleShuffle}
        className={`relative flex items-center justify-center w-14 h-14 rounded-md border-[2.5px] border-primary transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed ${
          shuffle
            ? "bg-surface-sunken translate-x-[2px] translate-y-[2px] shadow-sticker-pressed"
            : "bg-surface-raised shadow-sticker hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#1A2A86] active:translate-x-[3px] active:translate-y-[3px] active:shadow-sticker-pressed"
        }`}
      >
        <Shuffle className="w-6 h-6 text-primary" strokeWidth={2.5} />
        {shuffle && (
          <span
            className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-leaf border border-primary"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Previous Key */}
      <button
        type="button"
        title="Previous tune"
        aria-label="Previous tune"
        disabled={disabled}
        onClick={onPrev}
        className="flex items-center justify-center w-14 h-14 rounded-md bg-surface-raised border-[2.5px] border-primary shadow-sticker transition-all duration-150 hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipBack className="w-6 h-6 text-primary fill-primary" strokeWidth={2.5} />
      </button>

      {/* Play / Pause Hero Key: 72px tall/wide, Secondary (Lava) fill, Ultramarine icon */}
      <button
        type="button"
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={disabled}
        onClick={onTogglePlay}
        className="flex items-center justify-center w-[72px] h-[72px] rounded-md bg-secondary text-primary border-[3px] border-primary shadow-sticker transition-all duration-150 hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-primary fill-primary" strokeWidth={2.5} />
        ) : (
          <Play className="w-8 h-8 text-primary fill-primary ml-1" strokeWidth={2.5} />
        )}
      </button>

      {/* Next Key */}
      <button
        type="button"
        title="Next tune"
        aria-label="Next tune"
        disabled={disabled}
        onClick={onNext}
        className="flex items-center justify-center w-14 h-14 rounded-md bg-surface-raised border-[2.5px] border-primary shadow-sticker transition-all duration-150 hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SkipForward className="w-6 h-6 text-primary fill-primary" strokeWidth={2.5} />
      </button>

      {/* Repeat Key */}
      <button
        type="button"
        title={`Repeat: ${repeat}`}
        aria-label={`Repeat mode: ${repeat}`}
        aria-pressed={repeat !== "off"}
        disabled={disabled}
        onClick={onToggleRepeat}
        className={`relative flex items-center justify-center w-14 h-14 rounded-md border-[2.5px] border-primary transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed ${
          repeat !== "off"
            ? "bg-surface-sunken translate-x-[2px] translate-y-[2px] shadow-sticker-pressed"
            : "bg-surface-raised shadow-sticker hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#1A2A86] active:translate-x-[3px] active:translate-y-[3px] active:shadow-sticker-pressed"
        }`}
      >
        {repeat === "one" ? (
          <Repeat1 className="w-6 h-6 text-primary" strokeWidth={2.5} />
        ) : (
          <Repeat className="w-6 h-6 text-primary" strokeWidth={2.5} />
        )}
        {repeat !== "off" && (
          <span
            className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-leaf border border-primary"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}

