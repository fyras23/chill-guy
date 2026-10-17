"use client";

import React, { useState } from "react";
import type { Scene } from "@/lib/supabase/types";
import { SceneCard } from "./SceneCard";
import { reorderScenes } from "@/lib/actions/scenes";
import { toast } from "@/lib/toast-store";

interface SceneGridProps {
  initialScenes: Scene[];
  onRefresh: () => void;
}

export function SceneGrid({ initialScenes, onRefresh }: SceneGridProps) {
  const [reorderedList, setReorderedList] = useState<Scene[] | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const scenes = reorderedList ?? initialScenes;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...scenes];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    setReorderedList(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = scenes.map((s) => s.id);
    const res = await reorderScenes(orderedIds);
    setReorderedList(null);
    if (res?.error) {
      toast.error(res.error, "Could not save order");
      onRefresh();
    } else {
      toast.success("Scene order saved.");
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-raised border-[2.5px] border-dashed border-primary rounded-lg text-center mt-6">
        <h3 className="font-display text-xl font-bold text-primary mb-1">
          No scenes yet.
        </h3>
        <p className="font-body text-sm text-text-muted">
          Add images and they&apos;ll drift in while music plays.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {scenes.map((scene, idx) => (
        <div
          key={scene.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
        >
          <SceneCard
            scene={scene}
            index={idx}
            onRefresh={onRefresh}
          />
        </div>
      ))}
    </div>
  );
}

