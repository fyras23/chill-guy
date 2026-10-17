export interface Track {
  id: string;
  file?: File;
  objectUrl: string;
  name: string;
  title: string;
  artist: string;
  duration: number; // seconds
  coverUrl?: string;
  isLoadingMetadata?: boolean;
}

export type RepeatMode = "off" | "all" | "one";

