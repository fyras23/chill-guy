import { describe, it, expect } from "vitest";
import { parseFilename, naturalSortFiles } from "../metadata";

describe("Audio Metadata Fallback and Sorting", () => {
  describe("parseFilename", () => {
    it("parses Artist - Title.mp3", () => {
      const result = parseFilename("Tycho - Awake.mp3");
      expect(result.artist).toBe("Tycho");
      expect(result.title).toBe("Awake");
    });

    it("parses 01 - Artist - Title.mp3", () => {
      const result = parseFilename("01 - Bonobo - Kiara.flac");
      expect(result.artist).toBe("Bonobo");
      expect(result.title).toBe("Kiara");
    });

    it("handles single name without artist delimiter", () => {
      const result = parseFilename("ChillLofiBeat.wav");
      expect(result.artist).toBe("Unknown Artist");
      expect(result.title).toBe("ChillLofiBeat");
    });
  });

  describe("naturalSortFiles", () => {
    it("sorts filenames in natural human order (1, 2, 10 instead of 1, 10, 2)", () => {
      const files = [
        { name: "track10.mp3" } as File,
        { name: "track2.mp3" } as File,
        { name: "track1.mp3" } as File,
      ];

      const sorted = naturalSortFiles(files);
      expect(sorted.map((f) => f.name)).toEqual([
        "track1.mp3",
        "track2.mp3",
        "track10.mp3",
      ]);
    });
  });
});

