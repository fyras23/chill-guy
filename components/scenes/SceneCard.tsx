"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GripVertical, Trash2, Edit2, Check, AlertTriangle, Sparkles } from "lucide-react";
import type { Scene } from "@/lib/supabase/types";
import { getSceneQuality } from "@/lib/supabase/types";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { toast } from "@/lib/toast-store";
import { renameScene, toggleSceneActive, deleteScene } from "@/lib/actions/scenes";

interface SceneCardProps {
  scene: Scene;
  index: number;
  onRefresh: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function SceneCard({
  scene,
  index,
  onRefresh,
  dragHandleProps,
}: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(scene.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActive, setIsActive] = useState(scene.is_active);

  const quality = getSceneQuality(scene.width, scene.height);

  // Static micro-rotations for polaroid look (max +/- 1.2deg)
  const rotationClass = [
    "-rotate-[0.8deg]",
    "rotate-[1deg]",
    "-rotate-[0.5deg]",
    "rotate-[0.7deg]",
  ][index % 4];

  const handleSaveName = async () => {
    setIsEditing(false);
    if (!name.trim() || name === scene.name) {
      setName(scene.name);
      return;
    }

    const res = await renameScene({ id: scene.id, name: name.trim() });
    if (res?.error) {
      toast.error(res.error, "Could not rename scene");
      setName(scene.name);
    } else {
      toast.success("Scene renamed.");
      onRefresh();
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);
    const res = await toggleSceneActive({ id: scene.id, isActive: checked });
    if (res?.error) {
      toast.error(res.error, "Could not update state");
      setIsActive(scene.is_active);
    } else {
      toast.success(checked ? "Scene enabled." : "Scene disabled.");
      onRefresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteScene({ id: scene.id, fileKey: scene.file_key });
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (res?.error) {
      toast.error(res.error, "Could not delete scene");
    } else {
      toast.success("Scene deleted.");
      onRefresh();
    }
  };

  return (
    <>
      <div
        className={`relative flex flex-col bg-surface-raised border-[2.5px] border-primary rounded-wobble shadow-sticker p-3 select-none transition-transform duration-150 hover:-translate-y-1 hover:shadow-[5px_5px_0_#1A2A86] ${rotationClass}`}
      >
        {/* Top bar with drag handle and active toggle */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-primary/10">
          <div
            {...dragHandleProps}
            title="Drag to reorder"
            aria-label="Drag to reorder"
            className="flex items-center justify-center w-8 h-8 -ml-1 text-primary/40 hover:text-primary cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5" strokeWidth={2.5} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-body text-primary">
              {isActive ? "Active" : "Off"}
            </span>
            <Switch checked={isActive} onChange={handleToggleActive} />
          </div>
        </div>

        {/* 4:3 Polaroid Image Frame */}
        <div className="relative w-full aspect-[4/3] bg-surface-sunken border-2 border-primary rounded-sm overflow-hidden mb-3">
          <Image
            src={scene.url}
            alt={scene.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={index < 4}
          />
        </div>

        {/* Info & Editing */}
        <div className="flex flex-col gap-2 flex-1">
          {/* Editable Name */}
          <div className="flex items-center justify-between gap-1">
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveName();
                }}
                className="flex items-center gap-1 w-full"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleSaveName}
                  autoFocus
                  className="flex-1 px-2 py-0.5 bg-surface-sunken border border-primary rounded-sm text-sm font-bold font-body text-primary focus-ring"
                />
                <button
                  type="submit"
                  aria-label="Save name"
                  className="p-1 text-primary hover:text-leaf"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </form>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 cursor-pointer group flex-1 min-w-0"
              >
                <span
                  title={scene.name}
                  className="font-display font-bold text-base text-primary truncate"
                >
                  {scene.name}
                </span>
                <Edit2
                  className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary shrink-0 transition-colors"
                  strokeWidth={2.5}
                />
              </div>
            )}

            <button
              type="button"
              title="Delete scene"
              aria-label={`Delete ${scene.name}`}
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1.5 text-primary/50 hover:text-danger hover:bg-surface-sunken rounded-sm transition-colors focus-ring"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Metadata Row: Dimensions & Quality Badge */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-primary/10">
            <span className="font-lcd text-xs text-text-muted font-bold">
              {scene.width && scene.height
                ? `${scene.width} × ${scene.height}`
                : "Dimensions pending"}
            </span>

            {/* Quality Badge (Low = Warning, Good = Tertiary, Great = Leaf) */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-sm border border-primary text-xs font-bold font-body ${
                quality === "great"
                  ? "bg-leaf text-surface-raised"
                  : quality === "good"
                  ? "bg-tertiary text-primary"
                  : "bg-warning text-primary"
              }`}
            >
              {quality === "great" && (
                <Sparkles className="w-3 h-3 text-surface-raised" strokeWidth={2.5} />
              )}
              {quality === "good" && (
                <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
              )}
              {quality === "low" && (
                <AlertTriangle className="w-3 h-3 text-primary" strokeWidth={2.5} />
              )}
              <span className="capitalize">{quality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this scene?"
        description="Delete this scene? It's removed from storage and can't be undone."
        confirmLabel="Delete scene"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}

