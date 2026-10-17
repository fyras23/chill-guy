import type { Track } from "./types";

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
}

export function updateMediaSession(
  track: Track | null,
  isPlaying: boolean,
  callbacks: MediaSessionCallbacks
) {
  if (typeof window === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  if (!track) {
    navigator.mediaSession.metadata = null;
    return;
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: "Chill Guy Rooftop",
    artwork: track.coverUrl
      ? [
          { src: track.coverUrl, sizes: "96x96", type: "image/png" },
          { src: track.coverUrl, sizes: "256x256", type: "image/png" },
          { src: track.coverUrl, sizes: "512x512", type: "image/png" },
        ]
      : [],
  });

  navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

  try {
    navigator.mediaSession.setActionHandler("play", callbacks.onPlay);
    navigator.mediaSession.setActionHandler("pause", callbacks.onPause);
    navigator.mediaSession.setActionHandler("previoustrack", callbacks.onPrev);
    navigator.mediaSession.setActionHandler("nexttrack", callbacks.onNext);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        callbacks.onSeek(details.seekTime);
      }
    });
  } catch {
    // Action handlers might throw in some browser security contexts
  }
}

