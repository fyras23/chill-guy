export interface Scene {
  id: string;
  name: string;
  url: string;
  file_key: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type SceneQuality = "low" | "good" | "great";

export function getSceneQuality(width: number | null, height: number | null): SceneQuality {
  if (!width || !height) return "low";
  // Great: 2560x1440 or higher
  if (width >= 2560 && height >= 1440) return "great";
  // Good: 1920x1080 or higher
  if (width >= 1920 && height >= 1080) return "good";
  // Low: below 1920x1080
  return "low";
}

