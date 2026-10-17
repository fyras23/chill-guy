"use client";

import React from "react";
import type { Scene } from "@/lib/supabase/types";
import { SceneUploader } from "@/components/scenes/SceneUploader";
import { SceneGrid } from "@/components/scenes/SceneGrid";
import { useRouter } from "next/navigation";

export function ScenesManager({ initialScenes }: { initialScenes: Scene[] }) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="w-full">
      <SceneUploader onUploadComplete={handleRefresh} />
      <SceneGrid initialScenes={initialScenes} onRefresh={handleRefresh} />
    </div>
  );
}

