"use client";

import React from "react";
import { Slider } from "@/components/ui/Slider";

interface SeekTubeProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatAriaTime(current: number, total: number): string {
  const cM = Math.floor(current / 60);
  const cS = Math.floor(current % 60);
  const tM = Math.floor(total / 60);
  const tS = Math.floor(total % 60);
  return `${cM} minute${cM === 1 ? "" : "s"} ${cS} second${cS === 1 ? "" : "s"} of ${tM} minute${tM === 1 ? "" : "s"} ${tS} second${tS === 1 ? "" : "s"}`;
}

export function SeekTube({
  currentTime,
  duration,
  onSeek,
  disabled = false,
}: SeekTubeProps) {
  const max = duration > 0 ? duration : 100;
  const current = Math.min(currentTime, max);

  return (
    <div className="flex items-center gap-3 w-full select-none">
      {/* Current Time (VT323 LCD readout) */}
      <span
        className="font-lcd text-2xl text-primary font-bold min-w-[50px] text-right shrink-0"
        aria-hidden="true"
      >
        {formatTime(currentTime)}
      </span>

      {/* Seek Tube Slider */}
      <div className="flex-1">
        <Slider
          value={current}
          min={0}
          max={max}
          step={1}
          disabled={disabled}
          ariaValueText={formatAriaTime(currentTime, duration)}
          aria-label="Seek track"
          onChange={onSeek}
        />
      </div>

      {/* Duration (VT323 LCD readout) */}
      <span
        className="font-lcd text-2xl text-primary font-bold min-w-[50px] text-left shrink-0"
        aria-hidden="true"
      >
        {formatTime(duration)}
      </span>
    </div>
  );
}

