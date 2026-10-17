"use client";

import React, { useState } from "react";
import type { DefaultTrackDTO } from "@/lib/actions/playlist";
import { PlaylistUploader } from "./PlaylistUploader";
import { PlaylistTrackRow } from "./PlaylistTrackRow";
import { reorderDefaultTracks } from "@/lib/actions/playlist";
import { toast } from "@/lib/toast-store";
import { formatTime } from "@/components/deck/SeekTube";
import { Music, Disc3 } from "lucide-react";

interface PlaylistManagerProps {
  initialTracks: DefaultTrackDTO[];
  onRefresh: () => void;
}

export function PlaylistManager({
  initialTracks,
  onRefresh,
}: PlaylistManagerProps) {
  const [reorderedList, setReorderedList] = useState<DefaultTrackDTO[] | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const tracks = reorderedList ?? initialTracks;

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const activeCount = tracks.filter((t) => t.is_active).length;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...tracks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    setReorderedList(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = tracks.map((t) => t.id);
    const res = await reorderDefaultTracks(orderedIds);
    setReorderedList(null);

    if (res?.error) {
      toast.error(res.error, "Could not save track order");
      onRefresh();
    } else {
      toast.success("Playlist order saved.");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      {/* Upload Zone */}
      <PlaylistUploader onUploadComplete={onRefresh} />

      {/* Playlist List Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-primary/20">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-secondary" strokeWidth={2.5} />
          <h2 className="font-display text-xl font-bold text-primary">
            &quot;Chill Guy&quot; Default Track List
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-body font-bold text-text-muted">
          <span>{activeCount} of {tracks.length} active</span>
          {totalDuration > 0 && (
            <span>• {formatTime(totalDuration)} total</span>
          )}
        </div>
      </div>

      {/* Tracks Stack */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-raised border-[2.5px] border-dashed border-primary rounded-lg text-center">
          <Music className="w-10 h-10 text-primary/40 mb-2" strokeWidth={2.5} />
          <h3 className="font-display text-lg font-bold text-primary mb-1">
            No tracks in the &quot;Chill Guy&quot; playlist yet.
          </h3>
          <p className="font-body text-sm text-text-muted">
            Add MP3 tunes above and they will be available for all visitors to play instantly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <PlaylistTrackRow
                track={track}
                index={idx}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

