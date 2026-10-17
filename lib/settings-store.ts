import { create } from "zustand";

export interface SettingsState {
  sceneInterval: number; // 10 to 120, default 30
  transitionFeel: "soft" | "mixed"; // soft: 4-6s, mixed: 3-6s
  shuffleScenes: boolean; // default true
  driftMotion: boolean; // default true
  fitMode: "fill" | "fit"; // default fill
  autoEnterVibeOnPlay: boolean; // default true

  setSceneInterval: (interval: number) => void;
  setTransitionFeel: (feel: "soft" | "mixed") => void;
  setShuffleScenes: (shuffle: boolean) => void;
  setDriftMotion: (drift: boolean) => void;
  setFitMode: (mode: "fill" | "fit") => void;
  setAutoEnterVibeOnPlay: (auto: boolean) => void;
}

const SETTINGS_STORAGE_KEY = "chill_guy_settings_v1";

interface StoredSettings {
  sceneInterval?: number;
  transitionFeel?: "soft" | "mixed";
  shuffleScenes?: boolean;
  driftMotion?: boolean;
  fitMode?: "fill" | "fit";
  autoEnterVibeOnPlay?: boolean;
}

function loadInitialSettings(): StoredSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function persistSettings(data: StoredSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = loadInitialSettings();

  return {
    sceneInterval: initial.sceneInterval ?? 30,
    transitionFeel: initial.transitionFeel ?? "mixed",
    shuffleScenes: initial.shuffleScenes ?? true,
    driftMotion: initial.driftMotion ?? true,
    fitMode: initial.fitMode ?? "fill",
    autoEnterVibeOnPlay: initial.autoEnterVibeOnPlay ?? true,

    setSceneInterval: (interval: number) => {
      const clamped = Math.max(10, Math.min(120, interval));
      set({ sceneInterval: clamped });
      persistSettings({ ...get(), sceneInterval: clamped });
    },
    setTransitionFeel: (feel: "soft" | "mixed") => {
      set({ transitionFeel: feel });
      persistSettings({ ...get(), transitionFeel: feel });
    },
    setShuffleScenes: (shuffle: boolean) => {
      set({ shuffleScenes: shuffle });
      persistSettings({ ...get(), shuffleScenes: shuffle });
    },
    setDriftMotion: (drift: boolean) => {
      set({ driftMotion: drift });
      persistSettings({ ...get(), driftMotion: drift });
    },
    setFitMode: (mode: "fill" | "fit") => {
      set({ fitMode: mode });
      persistSettings({ ...get(), fitMode: mode });
    },
    setAutoEnterVibeOnPlay: (auto: boolean) => {
      set({ autoEnterVibeOnPlay: auto });
      persistSettings({ ...get(), autoEnterVibeOnPlay: auto });
    },
  };
});

