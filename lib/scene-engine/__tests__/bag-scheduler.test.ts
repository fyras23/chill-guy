import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createShuffledBag,
  getNextBagScene,
  ElapsedSceneClock,
} from "../bag-scheduler";
import type { Scene } from "@/lib/supabase/types";

const mockScenes: Scene[] = [
  { id: "1", name: "Rooftop Sun", url: "https://example.com/1.jpg", file_key: "k1", width: 1920, height: 1080, size_bytes: 100, sort_order: 0, is_active: true, created_at: "" },
  { id: "2", name: "Skyline Sunset", url: "https://example.com/2.jpg", file_key: "k2", width: 2560, height: 1440, size_bytes: 200, sort_order: 1, is_active: true, created_at: "" },
  { id: "3", name: "Lava Lamp Glow", url: "https://example.com/3.jpg", file_key: "k3", width: 3840, height: 2160, size_bytes: 300, sort_order: 2, is_active: true, created_at: "" },
  { id: "4", name: "Night Terrace", url: "https://example.com/4.jpg", file_key: "k4", width: 1920, height: 1080, size_bytes: 400, sort_order: 3, is_active: true, created_at: "" },
];

describe("Scene Engine Bag Scheduler", () => {
  describe("createShuffledBag", () => {
    it("contains all elements of the input scenes without duplicates", () => {
      const bag = createShuffledBag(mockScenes);
      expect(bag.length).toBe(mockScenes.length);
      const ids = bag.map((s) => s.id).sort();
      expect(ids).toEqual(["1", "2", "3", "4"]);
    });

    it("ensures the first element does not match lastSceneId when multiple scenes exist", () => {
      for (let i = 0; i < 20; i++) {
        const bag = createShuffledBag(mockScenes, "3");
        expect(bag[0].id).not.toBe("3");
      }
    });

    it("handles single-scene arrays gracefully", () => {
      const single = [mockScenes[0]];
      const bag = createShuffledBag(single, "1");
      expect(bag.length).toBe(1);
      expect(bag[0].id).toBe("1");
    });
  });

  describe("getNextBagScene", () => {
    it("depletes bag one by one and refills on exhaustion without back-to-back duplicate", () => {
      let remainingBag: Scene[] = [];
      let currentId: string | undefined = undefined;
      const seenIds: string[] = [];

      // Run through 8 selections (2 full bags)
      for (let i = 0; i < 8; i++) {
        const result = getNextBagScene(mockScenes, remainingBag, currentId, true);
        expect(result.nextScene).not.toBeNull();
        if (currentId) {
          expect(result.nextScene!.id).not.toBe(currentId);
        }
        currentId = result.nextScene!.id;
        seenIds.push(currentId);
        remainingBag = result.remainingBag;
      }

      // First 4 should contain all 4 distinct scenes
      expect(new Set(seenIds.slice(0, 4)).size).toBe(4);
      // Next 4 should also contain all 4 distinct scenes
      expect(new Set(seenIds.slice(4, 8)).size).toBe(4);
    });

    it("returns null when scenes array is empty", () => {
      const { nextScene } = getNextBagScene([], []);
      expect(nextScene).toBeNull();
    });
  });

  describe("ElapsedSceneClock", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("tracks progress accurately and pauses without losing accumulated time", () => {
      const clock = new ElapsedSceneClock(30); // 30s
      clock.start();

      vi.advanceTimersByTime(5000);
      const tick1 = clock.tick();
      expect(tick1.elapsedMs).toBeCloseTo(5000, -2);
      expect(tick1.isComplete).toBe(false);

      clock.pause();
      // While paused, advancing time does not increase elapsedMs
      vi.advanceTimersByTime(10000);
      const tickPaused = clock.tick();
      expect(tickPaused.elapsedMs).toBeCloseTo(5000, -2);

      // Resume
      clock.start();
      vi.advanceTimersByTime(25000);
      const tickComplete = clock.tick();
      expect(tickComplete.elapsedMs).toBeGreaterThanOrEqual(30000);
      expect(tickComplete.isComplete).toBe(true);
      expect(tickComplete.progress).toBe(1);
    });
  });
});

