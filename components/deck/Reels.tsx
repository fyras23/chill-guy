"use client";

import React from "react";

interface ReelsProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  hasTrack: boolean;
}

export function Reels({ isPlaying, progress, hasTrack }: ReelsProps) {
  // Clamp progress between 0 and 1
  const p = Math.max(0, Math.min(1, isNaN(progress) ? 0 : progress));

  // Left reel tape pack shrinks from 34px to 18px
  const leftRadius = 34 - p * (34 - 18);
  // Right reel tape pack grows from 18px to 34px
  const rightRadius = 18 + p * (34 - 18);

  if (!hasTrack) {
    return (
      <div className="relative w-full h-32 md:h-36 bg-surface-sunken/60 border-2 border-dashed border-primary/40 rounded-md flex items-center justify-center select-none">
        <span className="font-display text-primary/60 text-base md:text-lg">
          No tape yet
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-32 md:h-36 bg-[#EBD885] border-[2.5px] border-primary rounded-md overflow-hidden flex items-center justify-between px-8 md:px-14 shadow-inner select-none"
      aria-hidden="true"
    >
      {/* Tape ribbon connecting reels across the middle */}
      <div className="absolute top-[48%] left-16 right-16 h-3 bg-primary -translate-y-1/2 opacity-95" />

      {/* Left Reel & Tape Pack */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Left Tape Pack (Dark ultramarine tape wound around hub) */}
        <div
          className="absolute rounded-full bg-primary border border-primary transition-all duration-300"
          style={{
            width: `${leftRadius * 2}px`,
            height: `${leftRadius * 2}px`,
          }}
        />

        {/* Left Hub & Spokes SVG */}
        <svg
          viewBox="0 0 64 64"
          className={`relative w-16 h-16 ${isPlaying ? "animate-spin" : ""}`}
          style={{
            animationDuration: "2.4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {/* Outer Hub Ring */}
          <circle cx="32" cy="32" r="28" fill="#3BC6B8" stroke="#1A2A86" strokeWidth="3" />
          <circle cx="32" cy="32" r="16" fill="#FFF9E0" stroke="#1A2A86" strokeWidth="2.5" />
          {/* Center Hole */}
          <circle cx="32" cy="32" r="8" fill="#1A2A86" />

          {/* Three Spokes / Teeth */}
          <rect x="30" y="8" width="4" height="12" fill="#1A2A86" rx="1" />
          <rect
            x="30"
            y="8"
            width="4"
            height="12"
            fill="#1A2A86"
            rx="1"
            transform="rotate(120 32 32)"
          />
          <rect
            x="30"
            y="8"
            width="4"
            height="12"
            fill="#1A2A86"
            rx="1"
            transform="rotate(240 32 32)"
          />
        </svg>
      </div>

      {/* Center viewing cut-out window */}
      <div className="hidden sm:flex flex-col items-center justify-center w-20 h-16 bg-surface-raised border-2 border-primary rounded-sm p-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
        <div className="w-12 h-1 bg-primary/30 mb-2 rounded-full" />
        <span className="font-lcd text-xs text-primary font-bold">TYPE I</span>
        <span className="font-lcd text-[10px] text-text-muted">NORMAL</span>
      </div>

      {/* Right Reel & Tape Pack */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Right Tape Pack (Dark ultramarine tape growing) */}
        <div
          className="absolute rounded-full bg-primary border border-primary transition-all duration-300"
          style={{
            width: `${rightRadius * 2}px`,
            height: `${rightRadius * 2}px`,
          }}
        />

        {/* Right Hub & Spokes SVG */}
        <svg
          viewBox="0 0 64 64"
          className={`relative w-16 h-16 ${isPlaying ? "animate-spin" : ""}`}
          style={{
            animationDuration: "2.4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {/* Outer Hub Ring */}
          <circle cx="32" cy="32" r="28" fill="#3BC6B8" stroke="#1A2A86" strokeWidth="3" />
          <circle cx="32" cy="32" r="16" fill="#FFF9E0" stroke="#1A2A86" strokeWidth="2.5" />
          {/* Center Hole */}
          <circle cx="32" cy="32" r="8" fill="#1A2A86" />

          {/* Three Spokes / Teeth */}
          <rect x="30" y="8" width="4" height="12" fill="#1A2A86" rx="1" />
          <rect
            x="30"
            y="8"
            width="4"
            height="12"
            fill="#1A2A86"
            rx="1"
            transform="rotate(120 32 32)"
          />
          <rect
            x="30"
            y="8"
            width="4"
            height="12"
            fill="#1A2A86"
            rx="1"
            transform="rotate(240 32 32)"
          />
        </svg>
      </div>
    </div>
  );
}

