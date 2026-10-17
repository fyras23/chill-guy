"use client";

import React from "react";
import { useSettingsStore } from "@/lib/settings-store";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { X } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const sceneInterval = useSettingsStore((s) => s.sceneInterval);
  const transitionFeel = useSettingsStore((s) => s.transitionFeel);
  const shuffleScenes = useSettingsStore((s) => s.shuffleScenes);
  const driftMotion = useSettingsStore((s) => s.driftMotion);
  const fitMode = useSettingsStore((s) => s.fitMode);
  const autoEnterVibeOnPlay = useSettingsStore((s) => s.autoEnterVibeOnPlay);

  const setSceneInterval = useSettingsStore((s) => s.setSceneInterval);
  const setTransitionFeel = useSettingsStore((s) => s.setTransitionFeel);
  const setShuffleScenes = useSettingsStore((s) => s.setShuffleScenes);
  const setDriftMotion = useSettingsStore((s) => s.setDriftMotion);
  const setFitMode = useSettingsStore((s) => s.setFitMode);
  const setAutoEnterVibeOnPlay = useSettingsStore((s) => s.setAutoEnterVibeOnPlay);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vibe Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-raised border-[3px] border-primary rounded-lg shadow-sticker p-6 text-primary flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-primary/20">
          <h2 className="font-display text-xl font-bold text-primary">
            Vibe Settings
          </h2>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="p-1 rounded-sm text-primary hover:bg-surface-sunken focus-ring"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Setting 1: Scene Interval (10 to 120s) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold font-body">
            <span>Scene Interval</span>
            <span className="font-lcd text-lg text-primary">{sceneInterval}s</span>
          </div>
          <Slider
            value={sceneInterval}
            min={10}
            max={120}
            step={5}
            aria-label="Scene interval in seconds"
            onChange={setSceneInterval}
          />
        </div>

        {/* Setting 2: Transition Feel */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="block text-sm font-bold font-body">Transition Feel</span>
            <span className="text-xs text-text-muted">
              {transitionFeel === "soft" ? "Soft (4-6s)" : "Mixed (3-6s)"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTransitionFeel("mixed")}
              className={`px-3 py-1 text-xs font-bold font-body rounded-sm border-2 border-primary transition-colors ${
                transitionFeel === "mixed"
                  ? "bg-secondary text-primary"
                  : "bg-surface-sunken text-primary/70"
              }`}
            >
              Mixed
            </button>
            <button
              type="button"
              onClick={() => setTransitionFeel("soft")}
              className={`px-3 py-1 text-xs font-bold font-body rounded-sm border-2 border-primary transition-colors ${
                transitionFeel === "soft"
                  ? "bg-secondary text-primary"
                  : "bg-surface-sunken text-primary/70"
              }`}
            >
              Soft
            </button>
          </div>
        </div>

        {/* Setting 3: Shuffle Scenes */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="block text-sm font-bold font-body">Shuffle Scenes</span>
            <span className="text-xs text-text-muted">Randomize scene order in bag</span>
          </div>
          <Switch checked={shuffleScenes} onChange={setShuffleScenes} />
        </div>

        {/* Setting 4: Drift Motion */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="block text-sm font-bold font-body">Drift Motion</span>
            <span className="text-xs text-text-muted">Slow zoom and pan across pictures</span>
          </div>
          <Switch checked={driftMotion} onChange={setDriftMotion} />
        </div>

        {/* Setting 5: Fit Mode */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="block text-sm font-bold font-body">Image Fit</span>
            <span className="text-xs text-text-muted">
              {fitMode === "fill" ? "Fill (Cover screen)" : "Fit with backdrop"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFitMode("fill")}
              className={`px-3 py-1 text-xs font-bold font-body rounded-sm border-2 border-primary transition-colors ${
                fitMode === "fill"
                  ? "bg-secondary text-primary"
                  : "bg-surface-sunken text-primary/70"
              }`}
            >
              Fill
            </button>
            <button
              type="button"
              onClick={() => setFitMode("fit")}
              className={`px-3 py-1 text-xs font-bold font-body rounded-sm border-2 border-primary transition-colors ${
                fitMode === "fit"
                  ? "bg-secondary text-primary"
                  : "bg-surface-sunken text-primary/70"
              }`}
            >
              Fit
            </button>
          </div>
        </div>

        {/* Setting 6: Auto-enter Vibe on Play */}
        <div className="flex items-center justify-between py-1 border-t border-primary/10 pt-3">
          <div>
            <span className="block text-sm font-bold font-body">Auto-enter Vibe</span>
            <span className="text-xs text-text-muted">Go fullscreen on play click</span>
          </div>
          <Switch checked={autoEnterVibeOnPlay} onChange={setAutoEnterVibeOnPlay} />
        </div>
      </div>
    </div>
  );
}

