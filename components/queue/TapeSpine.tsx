"use client";

import React from "react";
import { GripVertical, X, Volume2 } from "lucide-react";
import type { Track } from "@/lib/audio/types";
import { formatTime } from "@/components/deck/SeekTube";

interface TapeSpineProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function TapeSpine({
  track,
  index,
  isCurrent,
  isPlaying,
  onSelect,
  onRemove,
  dragHandleProps,
}: TapeSpineProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Track ${index + 1}: ${track.title} by ${track.artist}`}
      aria-current={isCurrent ? "true" : undefined}
      className={`group relative flex items-center h-14 w-full px-3 gap-3 rounded-md cursor-pointer select-none transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[2px] ${
        isCurrent
          ? "p-[3px] tie-dye-ring shadow-sticker"
          : "bg-surface-raised border-[2.5px] border-primary shadow-sticker hover:-translate-y-px hover:shadow-[5px_5px_0_#1A2A86]"
      }`}
    >
      {/* Inner container to hold content cleanly inside conic border if current */}
      <div
        className={`flex items-center w-full h-full px-2 gap-3 rounded-[13px] ${
          isCurrent ? "bg-surface-raised" : "bg-transparent"
        }`}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          title="Drag to reorder"
          aria-label="Drag to reorder"
          className="flex items-center justify-center w-8 h-8 -ml-1 text-primary/40 group-hover:text-primary cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" strokeWidth={2.5} />
        </div>

        {/* Track Number / Playing Equalizer Indicator */}
        <div className="flex items-center justify-center w-7 h-7 shrink-0 font-lcd text-lg font-bold text-primary">
          {isCurrent ? (
            isPlaying ? (
              /* 3-bar animated equalizer */
              <div
                className="flex items-end justify-center gap-1 w-5 h-5"
                aria-label="Playing equalizer"
              >
                <span className="w-1 bg-secondary rounded-full eq-bar-1" />
                <span className="w-1 bg-tertiary rounded-full eq-bar-2" />
                <span className="w-1 bg-leaf rounded-full eq-bar-3" />
              </div>
            ) : (
              /* Static playing icon when paused */
              <Volume2 className="w-4 h-4 text-primary" strokeWidth={2.5} aria-label="Paused" />
            )
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Title and Artist */}
        <div className="flex-1 min-w-0 pr-2">
          <p
            title={track.title}
            className={`text-sm truncate font-body leading-tight ${
              isCurrent ? "font-bold text-primary" : "font-semibold text-primary"
            }`}
          >
            {track.title}
          </p>
          <p
            title={track.artist}
            className="text-xs truncate font-body text-text-muted leading-tight mt-0.5"
          >
            {track.artist}
          </p>
        </div>

        {/* Duration (VT323 LCD readout) */}
        {track.duration > 0 && (
          <span className="font-lcd text-base text-primary font-bold shrink-0">
            {formatTime(track.duration)}
          </span>
        )}

        {/* Remove button */}
        <button
          type="button"
          title={`Remove ${track.title}`}
          aria-label={`Remove ${track.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-sm text-primary/50 hover:text-danger hover:bg-surface-sunken transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-info"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

