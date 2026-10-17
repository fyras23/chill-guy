"use client";

import React from "react";
import { usePlayerStore } from "@/lib/audio/player-store";
import { SeekTube } from "@/components/deck/SeekTube";
import { Play, Pause, SkipBack, SkipForward, X, Settings2 } from "lucide-react";

interface HudProps {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onExitVibe: () => void;
  onToggleSettings: () => void;
}

export function Hud({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onExitVibe,
  onToggleSettings,
}: HudProps) {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seek = usePlayerStore((s) => s.seek);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  return (
    <div
      role="region"
      aria-label="Vibe Player Controls"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[560px] z-50 bg-surface-raised border-[3px] border-primary rounded-lg shadow-hud p-4 md:p-5 select-none transition-all duration-400 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* Title & Artist & Controls Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h2
            title={currentTrack ? currentTrack.title : "No tape inserted"}
            className="font-display font-bold text-base md:text-lg text-primary truncate leading-tight"
          >
            {currentTrack ? currentTrack.title : "No tape inserted"}
          </h2>
          <p
            title={currentTrack ? currentTrack.artist : "Chill Guy Rooftop"}
            className="font-body text-xs md:text-sm text-text-muted truncate leading-snug"
          >
            {currentTrack ? currentTrack.artist : "Chill Guy Rooftop"}
          </p>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            title="Previous tune"
            aria-label="Previous tune"
            disabled={!currentTrack}
            onClick={prevTrack}
            className="flex items-center justify-center w-10 h-10 rounded-sm bg-surface-sunken hover:bg-surface-sunken/80 border-2 border-primary text-primary transition-transform active:translate-y-0.5 focus-ring disabled:opacity-40"
          >
            <SkipBack className="w-4 h-4 fill-primary" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!currentTrack}
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-md bg-secondary border-2 border-primary text-primary shadow-[2px_2px_0_#1A2A86] transition-transform active:translate-y-0.5 focus-ring disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-primary" strokeWidth={2.5} />
            ) : (
              <Play className="w-6 h-6 fill-primary ml-0.5" strokeWidth={2.5} />
            )}
          </button>

          <button
            type="button"
            title="Next tune"
            aria-label="Next tune"
            disabled={!currentTrack}
            onClick={nextTrack}
            className="flex items-center justify-center w-10 h-10 rounded-sm bg-surface-sunken hover:bg-surface-sunken/80 border-2 border-primary text-primary transition-transform active:translate-y-0.5 focus-ring disabled:opacity-40"
          >
            <SkipForward className="w-4 h-4 fill-primary" strokeWidth={2.5} />
          </button>

          {/* Settings button */}
          <button
            type="button"
            title="Vibe settings"
            aria-label="Vibe settings"
            onClick={onToggleSettings}
            className="flex items-center justify-center w-9 h-9 rounded-sm text-primary hover:bg-surface-sunken transition-colors focus-ring"
          >
            <Settings2 className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Exit Vibe mode button */}
          <button
            type="button"
            title="Exit Vibe mode"
            aria-label="Exit Vibe mode"
            onClick={onExitVibe}
            className="flex items-center justify-center w-9 h-9 rounded-sm text-primary hover:bg-surface-sunken hover:text-danger transition-colors focus-ring"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Seek Tube Slider */}
      <SeekTube
        currentTime={currentTime}
        duration={duration}
        disabled={!currentTrack}
        onSeek={seek}
      />
    </div>
  );
}

