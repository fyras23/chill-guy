import type { Scene } from "@/lib/supabase/types";

/**
 * Creates a shuffled array using Fisher-Yates algorithm.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a new shuffled bag ensuring the first element of the new bag
 * does not equal the last element of the previous bag (if pool has > 1 items).
 */
export function createShuffledBag(scenes: Scene[], lastSceneId?: string): Scene[] {
  if (scenes.length <= 1) {
    return [...scenes];
  }

  const bag = shuffleArray(scenes);

  // If the first scene in the new bag equals the last played scene, swap it
  if (lastSceneId && bag[0].id === lastSceneId) {
    // Pick another index (1 to bag.length - 1) to swap with
    const swapIdx = Math.floor(Math.random() * (bag.length - 1)) + 1;
    [bag[0], bag[swapIdx]] = [bag[swapIdx], bag[0]];
  }

  return bag;
}

/**
 * Returns the next scene from the bag and the remaining bag.
 * If bag is empty, refills it using createShuffledBag.
 */
export function getNextBagScene(
  allScenes: Scene[],
  currentBag: Scene[],
  currentSceneId?: string,
  isShuffle: boolean = true
): { nextScene: Scene | null; remainingBag: Scene[] } {
  if (allScenes.length === 0) {
    return { nextScene: null, remainingBag: [] };
  }

  if (allScenes.length === 1) {
    return { nextScene: allScenes[0], remainingBag: [] };
  }

  if (!isShuffle) {
    // Sequential order
    const currentIdx = allScenes.findIndex((s) => s.id === currentSceneId);
    const nextIdx = (currentIdx + 1) % allScenes.length;
    return { nextScene: allScenes[nextIdx], remainingBag: [] };
  }

  let bag = [...currentBag];
  if (bag.length === 0) {
    bag = createShuffledBag(allScenes, currentSceneId);
  }

  const nextScene = bag[0];
  const remainingBag = bag.slice(1);

  return { nextScene, remainingBag };
}

/**
 * High precision elapsed-time clock that tracks running vs paused time.
 * Handles pause/resume without resetting scene timing.
 */
export class ElapsedSceneClock {
  private targetDurationMs: number;
  private elapsedMs: number = 0;
  private lastTimestamp: number | null = null;
  private isRunning: boolean = false;

  constructor(durationSeconds: number) {
    this.targetDurationMs = durationSeconds * 1000;
  }

  public setDuration(durationSeconds: number): void {
    this.targetDurationMs = durationSeconds * 1000;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
  }

  public pause(): void {
    if (!this.isRunning) return;
    if (this.lastTimestamp !== null) {
      this.elapsedMs += performance.now() - this.lastTimestamp;
    }
    this.isRunning = false;
    this.lastTimestamp = null;
  }

  public tick(): { isComplete: boolean; progress: number; elapsedMs: number } {
    if (this.isRunning && this.lastTimestamp !== null) {
      const now = performance.now();
      const delta = now - this.lastTimestamp;
      this.lastTimestamp = now;
      this.elapsedMs += delta;
    }

    const progress = Math.min(1, this.targetDurationMs > 0 ? this.elapsedMs / this.targetDurationMs : 1);
    const isComplete = this.elapsedMs >= this.targetDurationMs;

    return {
      isComplete,
      progress,
      elapsedMs: this.elapsedMs,
    };
  }

  public reset(): void {
    this.elapsedMs = 0;
    this.lastTimestamp = this.isRunning ? performance.now() : null;
  }

  public getElapsed(): number {
    return this.elapsedMs;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

