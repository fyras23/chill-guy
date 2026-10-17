"use client";

import React, { useState } from "react";
import type { Scene } from "@/lib/supabase/types";
import type { DefaultTrackDTO } from "@/lib/actions/playlist";
import { SceneUploader } from "@/components/scenes/SceneUploader";
import { SceneGrid } from "@/components/scenes/SceneGrid";
import { PlaylistManager } from "@/components/playlist/PlaylistManager";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Music } from "lucide-react";

interface ScenesManagerProps {
  initialScenes: Scene[];
  initialTracks: DefaultTrackDTO[];
}

export function ScenesManager({ initialScenes, initialTracks }: ScenesManagerProps) {
  const [activeTab, setActiveTab] = useState<"scenes" | "playlist">("playlist");
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b-2 border-primary/20 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("playlist")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold font-body text-sm border-2 border-primary transition-all ${
            activeTab === "playlist"
              ? "bg-secondary text-primary shadow-sticker -translate-y-0.5"
              : "bg-surface-raised text-primary/80 hover:bg-surface-sunken"
          }`}
        >
          <Music className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <span>Chill Guy Playlist ({initialTracks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold font-body text-sm border-2 border-primary transition-all ${
            activeTab === "scenes"
              ? "bg-secondary text-primary shadow-sticker -translate-y-0.5"
              : "bg-surface-raised text-primary/80 hover:bg-surface-sunken"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <span>Vibe Scenes ({initialScenes.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "playlist" ? (
        <PlaylistManager
          initialTracks={initialTracks}
          onRefresh={handleRefresh}
        />
      ) : (
        <div className="w-full">
          <SceneUploader onUploadComplete={handleRefresh} />
          <SceneGrid initialScenes={initialScenes} onRefresh={handleRefresh} />
        </div>
      )}
    </div>
  );
}
