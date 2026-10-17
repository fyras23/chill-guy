import React, { Suspense } from "react";
import { getActiveScenes } from "@/lib/actions/scenes";
import { getPublicDefaultPlaylist } from "@/lib/actions/playlist";
import { HomeClient } from "@/components/deck/HomeClient";

export const instant = false;

export default async function HomePage() {
  const [activeScenes, defaultPlaylist] = await Promise.all([
    getActiveScenes(),
    getPublicDefaultPlaylist().catch((err) => {
      console.error("Failed to load default playlist:", err);
      return [];
    }),
  ]);

  return (
    <Suspense fallback={null}>
      <HomeClient
        initialScenes={activeScenes}
        defaultPlaylist={defaultPlaylist}
      />
    </Suspense>
  );
}
