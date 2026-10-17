import { create } from "zustand";
import type { Track, RepeatMode } from "./types";
import {
  getNextTrackIndex,
  getPrevTrackIndex,
  reorderArray,
  calculateIndexAfterRemoval,
} from "./queue-helpers";
import { parseAudioMetadata } from "./metadata";

// Local storage helpers
const STORAGE_KEY_VOLUME = "chill_guy_volume";
const STORAGE_KEY_MUTED = "chill_guy_muted";
const STORAGE_KEY_SHUFFLE = "chill_guy_shuffle";
const STORAGE_KEY_REPEAT = "chill_guy_repeat";

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return JSON.parse(val) as T;
  } catch {
    // ignore
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  unplayedShuffleIndices: number[];
  isVibeActive: boolean;
  isQueueOpen: boolean;
  hasInteracted: boolean;

  // Actions
  addTracks: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setCurrentIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVibeActive: (active: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  updateTrackMetadata: (id: string, metadata: Partial<Track>) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: getStored(STORAGE_KEY_VOLUME, 0.8),
  isMuted: getStored(STORAGE_KEY_MUTED, false),
  shuffle: getStored(STORAGE_KEY_SHUFFLE, false),
  repeat: getStored<RepeatMode>(STORAGE_KEY_REPEAT, "off"),
  unplayedShuffleIndices: [],
  isVibeActive: false,
  isQueueOpen: false,
  hasInteracted: false,

  addTracks: (newTracks: Track[]) => {
    const state = get();
    const updatedQueue = [...state.queue, ...newTracks];
    const newCurrentIndex = state.currentIndex === -1 && updatedQueue.length > 0 ? 0 : state.currentIndex;

    set({
      queue: updatedQueue,
      currentIndex: newCurrentIndex,
    });

    // Parse metadata in background lazily
    newTracks.forEach(async (track) => {
      if (track.file) {
        try {
          const parsed = await parseAudioMetadata(track.file);
          get().updateTrackMetadata(track.id, {
            title: parsed.title,
            artist: parsed.artist,
            duration: parsed.duration || track.duration,
            coverUrl: parsed.coverUrl,
            isLoadingMetadata: false,
          });
        } catch {
          get().updateTrackMetadata(track.id, { isLoadingMetadata: false });
        }
      }
    });
  },

  removeTrack: (id: string) => {
    const state = get();
    const removeIdx = state.queue.findIndex((t) => t.id === id);
    if (removeIdx === -1) return;

    const trackToRemove = state.queue[removeIdx];
    // Revoke object URLs to prevent memory leaks
    if (trackToRemove.objectUrl) {
      try {
        URL.revokeObjectURL(trackToRemove.objectUrl);
      } catch {
        // ignore
      }
    }
    if (trackToRemove.coverUrl) {
      try {
        URL.revokeObjectURL(trackToRemove.coverUrl);
      } catch {
        // ignore
      }
    }

    const nextIndex = calculateIndexAfterRemoval(state.queue.length, state.currentIndex, removeIdx);
    const updatedQueue = state.queue.filter((_, idx) => idx !== removeIdx);

    set({
      queue: updatedQueue,
      currentIndex: nextIndex,
      isPlaying: updatedQueue.length === 0 ? false : state.isPlaying,
      currentTime: removeIdx === state.currentIndex ? 0 : state.currentTime,
    });
  },

  clearQueue: () => {
    const state = get();
    state.queue.forEach((track) => {
      if (track.objectUrl) {
        try {
          URL.revokeObjectURL(track.objectUrl);
        } catch {
          // ignore
        }
      }
      if (track.coverUrl) {
        try {
          URL.revokeObjectURL(track.coverUrl);
        } catch {
          // ignore
        }
      }
    });

    set({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      unplayedShuffleIndices: [],
    });
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    const state = get();
    const newQueue = reorderArray(state.queue, fromIndex, toIndex);

    let newCurrentIndex = state.currentIndex;
    if (state.currentIndex === fromIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
      newCurrentIndex--;
    } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
      newCurrentIndex++;
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIndex,
    });
  },

  setCurrentIndex: (index: number) => {
    const state = get();
    if (index >= 0 && index < state.queue.length) {
      set({
        currentIndex: index,
        currentTime: 0,
        isPlaying: true,
        hasInteracted: true,
      });
    }
  },

  play: () => {
    const state = get();
    if (state.queue.length > 0) {
      set({
        isPlaying: true,
        currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
        hasInteracted: true,
      });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const state = get();
    if (state.isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  nextTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;

    const { nextIndex, newUnplayedIndices } = getNextTrackIndex(
      state.queue.length,
      state.currentIndex,
      state.repeat,
      state.shuffle,
      state.unplayedShuffleIndices
    );

    if (nextIndex !== -1) {
      set({
        currentIndex: nextIndex,
        currentTime: 0,
        unplayedShuffleIndices: newUnplayedIndices,
        isPlaying: true,
      });
    } else {
      set({
        isPlaying: false,
        currentTime: 0,
      });
    }
  },

  prevTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;

    const { prevIndex, shouldRestart } = getPrevTrackIndex(
      state.queue.length,
      state.currentIndex,
      state.currentTime,
      state.repeat
    );

    if (shouldRestart) {
      set({ currentTime: 0 });
    } else if (prevIndex !== -1) {
      set({
        currentIndex: prevIndex,
        currentTime: 0,
        isPlaying: true,
      });
    }
  },

  seek: (seconds: number) => {
    set({ currentTime: seconds });
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    setStored(STORAGE_KEY_VOLUME, clamped);
    setStored(STORAGE_KEY_MUTED, clamped === 0);
  },

  toggleMute: () => {
    const state = get();
    const newMuted = !state.isMuted;
    set({ isMuted: newMuted });
    setStored(STORAGE_KEY_MUTED, newMuted);
  },

  toggleShuffle: () => {
    const state = get();
    const newShuffle = !state.shuffle;
    set({
      shuffle: newShuffle,
      unplayedShuffleIndices: [],
    });
    setStored(STORAGE_KEY_SHUFFLE, newShuffle);
  },

  toggleRepeat: () => {
    const state = get();
    const modes: RepeatMode[] = ["off", "all", "one"];
    const nextMode = modes[(modes.indexOf(state.repeat) + 1) % modes.length];
    set({ repeat: nextMode });
    setStored(STORAGE_KEY_REPEAT, nextMode);
  },

  setVibeActive: (active: boolean) => {
    set({ isVibeActive: active });
  },

  setQueueOpen: (open: boolean) => {
    set({ isQueueOpen: open });
  },

  updateTrackMetadata: (id: string, metadata: Partial<Track>) => {
    set((state) => ({
      queue: state.queue.map((t) => (t.id === id ? { ...t, ...metadata } : t)),
    }));
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },
}));

