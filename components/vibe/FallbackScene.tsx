"use client";

import React from "react";

export function FallbackScene({ isPlaying }: { isPlaying: boolean }) {
  const playState = isPlaying ? "running" : "paused";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full bg-surface overflow-hidden pointer-events-none select-none"
    >
      <style jsx>{`
        @keyframes lavaBlob1 {
          0% { transform: translate(10vw, 90vh) scale(1); }
          50% { transform: translate(30vw, 15vh) scale(1.35); }
          100% { transform: translate(10vw, 90vh) scale(1); }
        }
        @keyframes lavaBlob2 {
          0% { transform: translate(65vw, 85vh) scale(1.2); }
          50% { transform: translate(45vw, 25vh) scale(0.9); }
          100% { transform: translate(65vw, 85vh) scale(1.2); }
        }
        @keyframes lavaBlob3 {
          0% { transform: translate(80vw, 30vh) scale(0.85); }
          50% { transform: translate(75vw, 80vh) scale(1.3); }
          100% { transform: translate(80vw, 30vh) scale(0.85); }
        }
        @keyframes lavaBlob4 {
          0% { transform: translate(25vw, 20vh) scale(1.1); }
          50% { transform: translate(15vw, 70vh) scale(0.95); }
          100% { transform: translate(25vw, 20vh) scale(1.1); }
        }
        @keyframes lavaBlob5 {
          0% { transform: translate(50vw, 95vh) scale(0.9); }
          50% { transform: translate(55vw, 10vh) scale(1.25); }
          100% { transform: translate(50vw, 95vh) scale(0.9); }
        }
        .blob-1 { animation: lavaBlob1 55s ease-in-out infinite; animation-play-state: ${playState}; }
        .blob-2 { animation: lavaBlob2 65s ease-in-out infinite; animation-play-state: ${playState}; }
        .blob-3 { animation: lavaBlob3 48s ease-in-out infinite; animation-play-state: ${playState}; }
        .blob-4 { animation: lavaBlob4 58s ease-in-out infinite; animation-play-state: ${playState}; }
        .blob-5 { animation: lavaBlob5 70s ease-in-out infinite; animation-play-state: ${playState}; }
      `}</style>

      {/* Blob 1: Lava Orange (#FF8A4C) */}
      <div
        className="blob-1 absolute w-[360px] h-[360px] md:w-[480px] md:h-[480px] rounded-full bg-secondary/70 filter blur-3xl"
      />

      {/* Blob 2: Mustard Warning (#E0A200) */}
      <div
        className="blob-2 absolute w-[340px] h-[340px] md:w-[440px] md:h-[440px] rounded-full bg-warning/60 filter blur-3xl"
      />

      {/* Blob 3: Teal Tertiary (#3BC6B8) */}
      <div
        className="blob-3 absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full bg-tertiary/65 filter blur-3xl"
      />

      {/* Blob 4: Sky Blue Info (#2459C9) */}
      <div
        className="blob-4 absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full bg-info/50 filter blur-3xl"
      />

      {/* Blob 5: Warm Secondary Light (#FF8A4C) */}
      <div
        className="blob-5 absolute w-[380px] h-[380px] md:w-[500px] md:h-[500px] rounded-full bg-secondary/55 filter blur-3xl"
      />
    </div>
  );
}

