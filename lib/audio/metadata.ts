import type { Track } from "./types";

export interface ParseResult {
  title: string;
  artist: string;
  duration: number;
  coverUrl?: string;
}

/**
 * Fallback parser for extracting artist and title from filename.
 * Handles "Artist - Title.ext" or "01 - Artist - Title.ext" or "Title.ext".
 */
export function parseFilename(filename: string): { title: string; artist: string } {
  // Strip file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "").trim();

  // Check for " - " delimiter
  const parts = nameWithoutExt.split(/\s*-\s*/);

  if (parts.length >= 3) {
    // Possibly "01 - Artist - Title"
    if (/^\d+$/.test(parts[0])) {
      return {
        artist: parts[1] || "Unknown Artist",
        title: parts.slice(2).join(" - ") || parts[1],
      };
    }
    return {
      artist: parts[0] || "Unknown Artist",
      title: parts.slice(1).join(" - "),
    };
  }

  if (parts.length === 2) {
    return {
      artist: parts[0] || "Unknown Artist",
      title: parts[1] || parts[0],
    };
  }

  return {
    artist: "Unknown Artist",
    title: nameWithoutExt || "Untitled Track",
  };
}

/**
 * Checks if browser can play the audio file.
 */
export function canBrowserPlayAudio(file: File): boolean {
  if (typeof window === "undefined") return true;

  const audio = document.createElement("audio");
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Common browser supported formats
  if (file.type) {
    const canPlay = audio.canPlayType(file.type);
    if (canPlay === "probably" || canPlay === "maybe") return true;
  }

  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    webm: "audio/webm",
  };

  const expectedMime = mimeMap[extension];
  if (expectedMime) {
    const canPlay = audio.canPlayType(expectedMime);
    return canPlay === "probably" || canPlay === "maybe" || ["mp3", "wav", "ogg", "m4a", "flac"].includes(extension);
  }

  return false;
}

/**
 * Dynamically loads music-metadata and extracts ID3 tags and cover art.
 */
export async function parseAudioMetadata(file: File): Promise<ParseResult> {
  const fallback = parseFilename(file.name);

  try {
    const mm = await import("music-metadata");
    const metadata = await mm.parseBlob(file, { duration: true, skipPostHeaders: true });

    let coverUrl: string | undefined = undefined;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format });
      coverUrl = URL.createObjectURL(blob);
    }

    return {
      title: metadata.common.title?.trim() || fallback.title,
      artist: metadata.common.artist?.trim() || fallback.artist,
      duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
      coverUrl,
    };
  } catch {
    // If ID3 parsing fails or file format is unknown to music-metadata, safely return fallback
    return {
      title: fallback.title,
      artist: fallback.artist,
      duration: 0,
    };
  }
}

/**
 * Natural sort for folder imports.
 */
export function naturalSortFiles(files: File[]): File[] {
  return [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );
}

/**
 * Creates a track object from a File.
 */
export function createTrackFromFile(file: File): Track {
  const { title, artist } = parseFilename(file.name);
  const objectUrl = URL.createObjectURL(file);
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    file,
    objectUrl,
    name: file.name,
    title,
    artist,
    duration: 0,
    isLoadingMetadata: true,
  };
}

