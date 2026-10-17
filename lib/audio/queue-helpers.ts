import type { RepeatMode } from "./types";

/**
 * Calculates the next track index given current state and queue.
 * Returns -1 if queue is ended (repeat off and at end).
 */
export function getNextTrackIndex(
  queueLength: number,
  currentIndex: number,
  repeat: RepeatMode,
  shuffle: boolean,
  unplayedShuffleIndices: number[] = []
): { nextIndex: number; newUnplayedIndices: number[] } {
  if (queueLength === 0) {
    return { nextIndex: -1, newUnplayedIndices: [] };
  }

  if (repeat === "one") {
    return { nextIndex: currentIndex, newUnplayedIndices: unplayedShuffleIndices };
  }

  if (shuffle) {
    let pool = [...unplayedShuffleIndices];
    // If pool is empty or only contains current index, refill pool with all indices except current
    if (pool.length === 0) {
      pool = Array.from({ length: queueLength }, (_, i) => i).filter(
        (i) => i !== currentIndex
      );
      // If queueLength is 1, currentIndex is the only index
      if (pool.length === 0 && queueLength === 1) {
        pool = [0];
      }
    }

    if (pool.length === 0) {
      if (repeat === "all") {
        return { nextIndex: 0, newUnplayedIndices: [] };
      }
      return { nextIndex: -1, newUnplayedIndices: [] };
    }

    // Pick random index from pool
    const randomPickIdx = Math.floor(Math.random() * pool.length);
    const nextIndex = pool[randomPickIdx];
    const newUnplayedIndices = pool.filter((_, idx) => idx !== randomPickIdx);

    return { nextIndex, newUnplayedIndices };
  }

  // Linear progression
  const next = currentIndex + 1;
  if (next < queueLength) {
    return { nextIndex: next, newUnplayedIndices: [] };
  }

  if (repeat === "all") {
    return { nextIndex: 0, newUnplayedIndices: [] };
  }

  return { nextIndex: -1, newUnplayedIndices: [] };
}

/**
 * Calculates the previous track index.
 * If currentTime > 3, it should signal restarting current track (return current index).
 * Otherwise moves to previous index.
 */
export function getPrevTrackIndex(
  queueLength: number,
  currentIndex: number,
  currentTime: number,
  repeat: RepeatMode
): { prevIndex: number; shouldRestart: boolean } {
  if (queueLength === 0 || currentIndex < 0) {
    return { prevIndex: -1, shouldRestart: false };
  }

  if (currentTime > 3) {
    return { prevIndex: currentIndex, shouldRestart: true };
  }

  if (currentIndex > 0) {
    return { prevIndex: currentIndex - 1, shouldRestart: false };
  }

  if (repeat === "all") {
    return { prevIndex: queueLength - 1, shouldRestart: false };
  }

  return { prevIndex: 0, shouldRestart: true };
}

/**
 * Pure reorder function for list manipulation.
 */
export function reorderArray<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= list.length ||
    toIndex < 0 ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return [...list];
  }

  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Pure remove function that adjusts the current index safely.
 */
export function calculateIndexAfterRemoval(
  queueLength: number,
  currentIndex: number,
  removedIndex: number
): number {
  const newLength = queueLength - 1;
  if (newLength <= 0) {
    return -1;
  }

  if (removedIndex < currentIndex) {
    return currentIndex - 1;
  }

  if (removedIndex === currentIndex) {
    return currentIndex >= newLength ? newLength - 1 : currentIndex;
  }

  return currentIndex;
}

