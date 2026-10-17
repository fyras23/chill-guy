"use client";

import React from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Slider } from "@/components/ui/Slider";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = isMuted || effectiveVolume === 0
    ? VolumeX
    : effectiveVolume < 0.5
    ? Volume1
    : Volume2;

  return (
    <div className="flex items-center gap-2 select-none">
      <button
        type="button"
        title={isMuted ? "Unmute" : "Mute"}
        aria-label={isMuted ? "Unmute" : "Mute"}
        onClick={onToggleMute}
        className="flex items-center justify-center w-11 h-11 rounded-sm text-primary hover:bg-surface-sunken transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[2px]"
      >
        <VolumeIcon className="w-5 h-5 text-primary" strokeWidth={2.5} />
      </button>

      <div className="w-28 sm:w-32">
        <Slider
          value={effectiveVolume}
          min={0}
          max={1}
          step={0.01}
          aria-label="Volume"
          ariaValueText={`${Math.round(effectiveVolume * 100)} percent`}
          onChange={onVolumeChange}
        />
      </div>
    </div>
  );
}

