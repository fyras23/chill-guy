import { describe, it, expect } from "vitest";
import {
  getNextTrackIndex,
  getPrevTrackIndex,
  reorderArray,
  calculateIndexAfterRemoval,
} from "../queue-helpers";

describe("Queue Helpers", () => {
  describe("getNextTrackIndex", () => {
    it("returns next sequential track index when repeat is off", () => {
      const { nextIndex } = getNextTrackIndex(3, 0, "off", false);
      expect(nextIndex).toBe(1);

      const second = getNextTrackIndex(3, 1, "off", false);
      expect(second.nextIndex).toBe(2);

      const end = getNextTrackIndex(3, 2, "off", false);
      expect(end.nextIndex).toBe(-1);
    });

    it("wraps around to 0 when repeat is 'all'", () => {
      const { nextIndex } = getNextTrackIndex(3, 2, "all", false);
      expect(nextIndex).toBe(0);
    });

    it("stays on current index when repeat is 'one'", () => {
      const { nextIndex } = getNextTrackIndex(3, 1, "one", false);
      expect(nextIndex).toBe(1);
    });

    it("handles shuffle by picking from unplayed pool", () => {
      const initial = getNextTrackIndex(4, 0, "off", true, [1, 2, 3]);
      expect([1, 2, 3]).toContain(initial.nextIndex);
      expect(initial.newUnplayedIndices.length).toBe(2);
      expect(initial.newUnplayedIndices).not.toContain(initial.nextIndex);
    });

    it("refills pool when empty in shuffle mode", () => {
      const result = getNextTrackIndex(3, 1, "all", true, []);
      expect([0, 2]).toContain(result.nextIndex);
      expect(result.newUnplayedIndices.length).toBe(1);
    });

    it("handles single-track queue", () => {
      const { nextIndex } = getNextTrackIndex(1, 0, "all", false);
      expect(nextIndex).toBe(0);

      const end = getNextTrackIndex(1, 0, "off", false);
      expect(end.nextIndex).toBe(-1);
    });
  });

  describe("getPrevTrackIndex", () => {
    it("restarts track if currentTime is > 3 seconds", () => {
      const result = getPrevTrackIndex(3, 1, 4.5, "off");
      expect(result.shouldRestart).toBe(true);
      expect(result.prevIndex).toBe(1);
    });

    it("moves to previous track if currentTime <= 3 seconds", () => {
      const result = getPrevTrackIndex(3, 2, 2.0, "off");
      expect(result.shouldRestart).toBe(false);
      expect(result.prevIndex).toBe(1);
    });

    it("wraps around to last track when at 0 and repeat is 'all'", () => {
      const result = getPrevTrackIndex(4, 0, 1.2, "all");
      expect(result.shouldRestart).toBe(false);
      expect(result.prevIndex).toBe(3);
    });

    it("restarts current track if at 0 and repeat is 'off'", () => {
      const result = getPrevTrackIndex(3, 0, 1.0, "off");
      expect(result.shouldRestart).toBe(true);
      expect(result.prevIndex).toBe(0);
    });
  });

  describe("reorderArray", () => {
    it("moves element from one position to another", () => {
      const items = ["A", "B", "C", "D"];
      const reordered = reorderArray(items, 0, 2);
      expect(reordered).toEqual(["B", "C", "A", "D"]);
    });

    it("handles no-op reorder", () => {
      const items = ["A", "B", "C"];
      expect(reorderArray(items, 1, 1)).toEqual(["A", "B", "C"]);
    });
  });

  describe("calculateIndexAfterRemoval", () => {
    it("returns -1 if the last item is removed", () => {
      expect(calculateIndexAfterRemoval(1, 0, 0)).toBe(-1);
    });

    it("decrements index if removed item was before current", () => {
      expect(calculateIndexAfterRemoval(4, 2, 0)).toBe(1);
    });

    it("keeps index if removed item was after current", () => {
      expect(calculateIndexAfterRemoval(4, 1, 3)).toBe(1);
    });

    it("adjusts to valid index if current item is removed", () => {
      // Removing the last item in a 3-item list where current was index 2
      expect(calculateIndexAfterRemoval(3, 2, 2)).toBe(1);
      // Removing item 1 in a 3-item list where current was index 1 -> stays 1 (now points to next item)
      expect(calculateIndexAfterRemoval(3, 1, 1)).toBe(1);
    });
  });
});

