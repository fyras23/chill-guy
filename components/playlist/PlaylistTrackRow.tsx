"use client";

import React, { useRef, useState } from "react";
import { GripVertical, Trash2, Edit2, Check, Play, Pause } from "lucide-react";
import type { DefaultTrackDTO } from "@/lib/actions/playlist";
import { formatTime } from "@/components/deck/SeekTube";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { toast } from "@/lib/toast-store";
import {
  updateDefaultTrackMetadata,
  toggleDefaultTrackActive,
  deleteDefaultTrack,
} from "@/lib/actions/playlist";

interface PlaylistTrackRowProps {
  track: DefaultTrackDTO;
  index: number;
  onRefresh: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function PlaylistTrackRow({
  track,
  index,
  onRefresh,
  dragHandleProps,
}: PlaylistTrackRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [isActive, setIsActive] = useState(track.is_active);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePreview = () => {
    if (!audioRef.current) return;
    if (isPreviewPlaying) {
      audioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPreviewPlaying(true)).catch(() => {});
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    if (!title.trim()) {
      setTitle(track.title);
      return;
    }

    const res = await updateDefaultTrackMetadata({
      id: track.id,
      title: title.trim(),
      artist: artist.trim() || "Chill Guy",
    });

    if (res?.error) {
      toast.error(res.error, "Could not update track");
      setTitle(track.title);
      setArtist(track.artist);
    } else {
      toast.success("Track updated.");
      onRefresh();
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);
    const res = await toggleDefaultTrackActive({ id: track.id, isActive: checked });
    if (res?.error) {
      toast.error(res.error, "Could not update track status");
      setIsActive(track.is_active);
    } else {
      toast.success(checked ? "Track enabled in playlist." : "Track disabled.");
      onRefresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteDefaultTrack({ id: track.id, fileKey: track.file_key });
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (res?.error) {
      toast.error(res.error, "Could not delete track");
    } else {
      toast.success("Track deleted from playlist.");
      onRefresh();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={track.url}
        onEnded={() => setIsPreviewPlaying(false)}
        onPause={() => setIsPreviewPlaying(false)}
        preload="none"
      />

      <div
        className={`group flex items-center h-16 w-full px-3 gap-3 rounded-md bg-surface-raised border-[2.5px] border-primary shadow-sticker transition-transform hover:-translate-y-px select-none ${
          !isActive ? "opacity-60" : ""
        }`}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          title="Drag to reorder"
          aria-label="Drag to reorder"
          className="flex items-center justify-center w-8 h-8 -ml-1 text-primary/40 group-hover:text-primary cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="w-5 h-5" strokeWidth={2.5} />
        </div>

        {/* Track number & Preview Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            title={isPreviewPlaying ? "Pause preview" : "Play preview"}
            aria-label={isPreviewPlaying ? "Pause preview" : "Play preview"}
            onClick={togglePreview}
            className="flex items-center justify-center w-8 h-8 rounded-sm bg-secondary text-primary border border-primary transition-transform active:translate-y-0.5"
          >
            {isPreviewPlaying ? (
              <Pause className="w-4 h-4 fill-primary" strokeWidth={2.5} />
            ) : (
              <Play className="w-4 h-4 fill-primary ml-0.5" strokeWidth={2.5} />
            )}
          </button>
          <span className="font-lcd text-sm text-text-muted font-bold min-w-[20px] text-center">
            {index + 1}
          </span>
        </div>

        {/* Title and Artist (Inline editable) */}
        <div className="flex-1 min-w-0 pr-2">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex items-center gap-2 w-full"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Track title"
                className="flex-1 px-2 py-0.5 bg-surface-sunken border border-primary rounded-sm text-sm font-bold font-body text-primary focus-ring"
                autoFocus
              />
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                className="w-32 px-2 py-0.5 bg-surface-sunken border border-primary rounded-sm text-xs font-body text-primary focus-ring"
              />
              <button
                type="submit"
                aria-label="Save"
                className="p-1 text-primary hover:text-leaf"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 cursor-pointer group/title"
            >
              <div className="truncate">
                <span className="font-bold text-sm font-body text-primary truncate block leading-tight">
                  {track.title}
                </span>
                <span className="text-xs text-text-muted font-body truncate block">
                  {track.artist}
                </span>
              </div>
              <Edit2
                className="w-3.5 h-3.5 text-primary/30 group-hover/title:text-primary shrink-0 transition-colors"
                strokeWidth={2.5}
              />
            </div>
          )}
        </div>

        {/* Duration */}
        {track.duration > 0 && (
          <span className="font-lcd text-base text-primary font-bold shrink-0">
            {formatTime(track.duration)}
          </span>
        )}

        {/* Active Toggle Switch */}
        <div className="shrink-0 flex items-center gap-2">
          <Switch checked={isActive} onChange={handleToggleActive} />
        </div>

        {/* Delete Button */}
        <button
          type="button"
          title={`Delete ${track.title}`}
          aria-label={`Delete ${track.title}`}
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-sm text-primary/50 hover:text-danger hover:bg-surface-sunken transition-colors shrink-0 focus-ring"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this track?"
        description={`Remove "${track.title}" from the Chill Guy default playlist? It will be permanently removed from storage.`}
        confirmLabel="Delete track"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}

