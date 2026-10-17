"use client";

import React, { useEffect, useRef } from "react";
import { usePlayerStore } from "@/lib/audio/player-store";
import { updateMediaSession } from "@/lib/audio/media-session";
import { toast } from "@/lib/toast-store";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const repeat = usePlayerStore((s) => s.repeat);
  const isVibeActive = usePlayerStore((s) => s.isVibeActive);
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen);

  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setVibeActive = usePlayerStore((s) => s.setVibeActive);
  const setQueueOpen = usePlayerStore((s) => s.setQueueOpen);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  const lastTrackIdRef = useRef<string | null>(null);

  // Sync track source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      lastTrackIdRef.current = null;
      return;
    }

    if (currentTrack.id !== lastTrackIdRef.current) {
      lastTrackIdRef.current = currentTrack.id;
      audio.src = currentTrack.objectUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => pause());
      }
    }
  }, [currentTrack, isPlaying, pause]);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(() => pause());
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  // Sync volume and mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync external seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 1.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Media Session integration
  useEffect(() => {
    updateMediaSession(currentTrack, isPlaying, {
      onPlay: play,
      onPause: pause,
      onNext: nextTrack,
      onPrev: prevTrack,
      onSeek: seek,
    });
  }, [currentTrack, isPlaying, play, pause, nextTrack, prevTrack, seek]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            e.preventDefault();
            prevTrack();
          } else {
            e.preventDefault();
            seek(Math.max(0, (audioRef.current?.currentTime || 0) - 5));
          }
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            e.preventDefault();
            nextTrack();
          } else {
            e.preventDefault();
            const dur = audioRef.current?.duration || 0;
            seek(Math.min(dur, (audioRef.current?.currentTime || 0) + 5));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "s":
        case "S":
          e.preventDefault();
          toggleShuffle();
          break;
        case "f":
        case "F":
          e.preventDefault();
          setVibeActive(!isVibeActive);
          break;
        case "q":
        case "Q":
          e.preventDefault();
          setQueueOpen(!isQueueOpen);
          break;
        case "Escape":
          if (isVibeActive) {
            e.preventDefault();
            setVibeActive(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    prevTrack,
    nextTrack,
    seek,
    setVolume,
    volume,
    toggleMute,
    toggleShuffle,
    isVibeActive,
    setVibeActive,
    isQueueOpen,
    setQueueOpen,
  ]);

  // Clean up object URLs on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      queue.forEach((t) => {
        if (t.objectUrl) {
          try {
            URL.revokeObjectURL(t.objectUrl);
          } catch {
            // ignore
          }
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [queue]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => pause());
      }
    } else {
      nextTrack();
    }
  };

  const handleError = () => {
    if (currentTrack) {
      toast.error(
        `${currentTrack.name} can't play in this browser. Try mp3, m4a, wav or ogg.`,
        "Playback error"
      );
      pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />
      {children}
    </>
  );
}

