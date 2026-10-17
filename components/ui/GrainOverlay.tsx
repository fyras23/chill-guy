"use client";

import React from "react";
import { usePlayerStore } from "@/lib/audio/player-store";

export function GrainOverlay() {
  const isVibeActive = usePlayerStore((s) => s.isVibeActive);

  if (isVibeActive) {
    return null;
  }

  return (
    <svg
      className="grain-overlay"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" />
    </svg>
  );
}

