"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/audio/player-store";
import { useSettingsStore } from "@/lib/settings-store";
import { Reels } from "./Reels";
import { SeekTube } from "./SeekTube";
import { Keys } from "./Keys";
import { VolumeControl } from "./VolumeControl";
import { ListMusic, Sparkles } from "lucide-react";

export function CassetteDeck() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const setVibeActive = usePlayerStore((s) => s.setVibeActive);
  const setQueueOpen = usePlayerStore((s) => s.setQueueOpen);

  const autoEnterVibeOnPlay = useSettingsStore((s) => s.autoEnterVibeOnPlay);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Track the initial load moment for the single entrance slide animation
  const prevQueueLengthRef = useRef(queue.length);
  const [justLoadedFirstTune, setJustLoadedFirstTune] = useState(false);

  useEffect(() => {
    if (prevQueueLengthRef.current === 0 && queue.length > 0) {
      setJustLoadedFirstTune(true);
      const timer = setTimeout(() => setJustLoadedFirstTune(false), 400);
      return () => clearTimeout(timer);
    }
    prevQueueLengthRef.current = queue.length;
  }, [queue.length]);

  const handlePlayClick = () => {
    if (!isPlaying && autoEnterVibeOnPlay) {
      setVibeActive(true);
      // User gesture context: request fullscreen on root
      if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Handled smoothly by 100dvh fallback overlay
        });
      }
    }
    togglePlay();
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      aria-label="Cassette Deck Player"
      className="w-full max-w-[640px] mx-auto bg-surface-raised border-[3px] border-primary rounded-lg shadow-sticker p-5 md:p-7 select-none flex flex-col gap-6"
    >
      {/* Top Deck Brand Plaque */}
      <div className="flex items-center justify-between border-b-2 border-primary/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary border border-primary" />
          <span className="font-lcd text-sm tracking-wider text-text-muted font-bold">
            CHILL-DECK STEREO 1979
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Open Vibe mode"
            aria-label="Open Vibe mode"
            onClick={() => setVibeActive(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-surface-sunken hover:bg-secondary/20 text-primary border-2 border-primary rounded-sm text-xs font-bold font-body transition-colors focus-ring"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" strokeWidth={2.5} />
            <span>Vibe</span>
          </button>
          <button
            type="button"
            title={isQueueOpen ? "Close queue" : "Open queue"}
            aria-label={isQueueOpen ? "Close queue" : "Open queue"}
            onClick={() => setQueueOpen(!isQueueOpen)}
            className="flex items-center gap-1.5 px-3 py-1 bg-surface-sunken hover:bg-secondary/20 text-primary border-2 border-primary rounded-sm text-xs font-bold font-body transition-colors focus-ring"
          >
            <ListMusic className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
            <span>Queue ({queue.length})</span>
          </button>
        </div>
      </div>

      {/* Cassette Tape Housing & Label Sticker */}
      <div
        className={`relative flex flex-col gap-4 p-4 md:p-5 bg-surface-sunken/40 border-[2.5px] border-primary rounded-md shadow-inner transition-transform duration-320 ${
          justLoadedFirstTune ? "animate-in slide-in-from-top-6 duration-300" : ""
        }`}
      >
        {/* Label Sticker */}
        <div className="w-full bg-surface-sunken border-2 border-primary rounded-wobble px-4 py-2.5 shadow-[2px_2px_0_#1A2A86] flex flex-col justify-center min-h-[58px]">
          <h2
            title={currentTrack ? currentTrack.title : "No tape inserted"}
            aria-label={currentTrack ? `Now playing: ${currentTrack.title}` : "No tape inserted"}
            className="font-display font-bold text-lg md:text-xl text-primary truncate leading-tight"
          >
            {currentTrack ? currentTrack.title : "No tape inserted"}
          </h2>
          <p
            title={currentTrack ? currentTrack.artist : "Pick tunes from your device to begin"}
            className="font-body text-xs md:text-sm text-text-muted truncate leading-normal"
          >
            {currentTrack ? currentTrack.artist : "Pick tunes from your device to begin"}
          </p>
        </div>

        {/* Tape Reel Window */}
        <Reels
          isPlaying={isPlaying}
          progress={progress}
          hasTrack={currentTrack !== null}
        />
      </div>

      {/* Seek Tube Slider and LCD Time readout */}
      <SeekTube
        currentTime={currentTime}
        duration={duration}
        disabled={!currentTrack}
        onSeek={seek}
      />

      {/* Chunky Transport Keys */}
      <Keys
        isPlaying={isPlaying}
        shuffle={shuffle}
        repeat={repeat}
        disabled={!currentTrack}
        onTogglePlay={handlePlayClick}
        onNext={nextTrack}
        onPrev={prevTrack}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
      />

      {/* Volume Knob / Tube Slider */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-primary/10">
        <span className="font-lcd text-xs text-text-muted font-bold">
          OUTPUT LEVEL
        </span>
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  );
}

