"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/audio/player-store";
import type { Scene } from "@/lib/supabase/types";
import { SceneStage } from "./SceneStage";
import { Hud } from "./Hud";
import { SettingsDrawer } from "./SettingsDrawer";

interface VibeRootProps {
  scenes: Scene[];
}

export function VibeRoot({ scenes }: VibeRootProps) {
  const isVibeActive = usePlayerStore((s) => s.isVibeActive);
  const setVibeActive = usePlayerStore((s) => s.setVibeActive);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isHoveringHud, setIsHoveringHud] = useState(false);
  const [isFocusedHud, setIsFocusedHud] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Wake lock management
  useEffect(() => {
    if (!isVibeActive) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // WakeLock may be rejected in battery saver mode or permission restricted
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isVibeActive) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isVibeActive]);

  // Idle timer for HUD auto-hide after 4 seconds
  const resetIdleTimer = React.useCallback(() => {
    setIsHudVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isHoveringHud && !isFocusedHud && !isSettingsOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsHudVisible(false);
      }, 4000);
    }
  }, [isHoveringHud, isFocusedHud, isSettingsOpen]);

  useEffect(() => {
    if (!isVibeActive) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isHoveringHud && !isFocusedHud && !isSettingsOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsHudVisible(false);
      }, 4000);
    }

    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [isVibeActive, isHoveringHud, isFocusedHud, isSettingsOpen, resetIdleTimer]);

  const handleExit = () => {
    setVibeActive(false);
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isVibeActive) return null;

  return (
    <div
      role="main"
      aria-label="Vibe Mode Fullscreen"
      className={`fixed inset-0 z-40 w-screen h-[100dvh] bg-primary overflow-hidden ${
        !isHudVisible ? "cursor-none" : ""
      }`}
    >
      {/* Drifting scenes stage */}
      <SceneStage scenes={scenes} isPlaying={isPlaying} />

      {/* Floating HUD at bottom center */}
      <Hud
        isVisible={isHudVisible || isSettingsOpen}
        onMouseEnter={() => {
          setIsHoveringHud(true);
          setIsHudVisible(true);
        }}
        onMouseLeave={() => {
          setIsHoveringHud(false);
          resetIdleTimer();
        }}
        onFocus={() => {
          setIsFocusedHud(true);
          setIsHudVisible(true);
        }}
        onBlur={() => {
          setIsFocusedHud(false);
          resetIdleTimer();
        }}
        onExitVibe={handleExit}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

