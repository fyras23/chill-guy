import { describe, it, expect } from "vitest";
import { defaultTrackToPlayerTrack, defaultPlaylistToTracks } from "../playlist-utils";
import type { DefaultTrackDTO } from "@/lib/actions/playlist";

describe("Playlist Utils", () => {
  const sampleTrackDTO: DefaultTrackDTO = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Midnight Chill",
    artist: "Lofi Guy",
    url: "https://utfs.io/f/sample-audio.mp3",
    file_key: "sample-audio.mp3",
    duration: 184,
    cover_url: "https://utfs.io/f/cover.png",
    size_bytes: 4500000,
    sort_order: 0,
    is_active: true,
    created_at: "2026-10-17T00:00:00.000Z",
  };

  it("converts a DefaultTrackDTO into an audio player Track object", () => {
    const track = defaultTrackToPlayerTrack(sampleTrackDTO);

    expect(track.id).toBe(sampleTrackDTO.id);
    expect(track.title).toBe("Midnight Chill");
    expect(track.artist).toBe("Lofi Guy");
    expect(track.name).toBe("Lofi Guy - Midnight Chill");
    expect(track.duration).toBe(184);
    expect(track.objectUrl).toBe("https://utfs.io/f/sample-audio.mp3");
    expect(track.coverUrl).toBe("https://utfs.io/f/cover.png");
    expect(track.file).toBeUndefined();
  });

  it("handles null cover_url gracefully", () => {
    const track = defaultTrackToPlayerTrack({
      ...sampleTrackDTO,
      cover_url: null,
    });
    expect(track.coverUrl).toBeUndefined();
  });

  it("converts a whole playlist of DTOs into tracks", () => {
    const tracks = defaultPlaylistToTracks([
      sampleTrackDTO,
      { ...sampleTrackDTO, id: "track-2", title: "Sunset Breeze", sort_order: 1 },
    ]);

    expect(tracks.length).toBe(2);
    expect(tracks[0].title).toBe("Midnight Chill");
    expect(tracks[1].title).toBe("Sunset Breeze");
  });
});

