import type { DefaultTrackDTO } from "@/lib/actions/playlist";
import type { Track } from "./types";

export function defaultTrackToPlayerTrack(track: DefaultTrackDTO): Track {
  return {
    id: track.id,
    objectUrl: track.url,
    name: `${track.artist} - ${track.title}`,
    title: track.title,
    artist: track.artist,
    duration: track.duration,
    coverUrl: track.cover_url ?? undefined,
  };
}

export function defaultPlaylistToTracks(playlist: DefaultTrackDTO[]): Track[] {
  return playlist.map(defaultTrackToPlayerTrack);
}

