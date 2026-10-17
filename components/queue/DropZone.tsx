"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast-store";
import { usePlayerStore } from "@/lib/audio/player-store";
import {
  canBrowserPlayAudio,
  createTrackFromFile,
  naturalSortFiles,
} from "@/lib/audio/metadata";

interface DropZoneProps {
  compact?: boolean;
}

export function DropZone({ compact = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addTracks = usePlayerStore((s) => s.addTracks);

  const handleFiles = (fileList: FileList | File[], source: "files" | "folder" | "drop" = "files") => {
    const rawFiles = Array.from(fileList);
    const audioFiles: File[] = [];
    const unsupportedFiles: File[] = [];

    rawFiles.forEach((file) => {
      // Basic check for audio mime or audio extensions
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isKnownAudio =
        file.type.startsWith("audio/") ||
        ["mp3", "m4a", "aac", "wav", "ogg", "flac", "webm"].includes(ext);

      if (isKnownAudio) {
        if (canBrowserPlayAudio(file)) {
          audioFiles.push(file);
        } else {
          unsupportedFiles.push(file);
        }
      }
    });

    if (unsupportedFiles.length > 0) {
      unsupportedFiles.slice(0, 3).forEach((f) => {
        toast.error(
          `${f.name} can't play in this browser. Try mp3, m4a, wav or ogg.`,
          "Unsupported format"
        );
      });
      if (unsupportedFiles.length > 3) {
        toast.error(
          `And ${unsupportedFiles.length - 3} other files could not be played.`,
          "Unsupported format"
        );
      }
    }

    if (audioFiles.length === 0) {
      if (rawFiles.length > 0 && unsupportedFiles.length === 0) {
        toast.warning("No supported audio files found. Try mp3, m4a, wav or ogg.");
      }
      return;
    }

    const sortedFiles = naturalSortFiles(audioFiles);
    const newTracks = sortedFiles.map(createTrackFromFile);
    addTracks(newTracks);

    if (source === "folder") {
      toast.success(`Added ${newTracks.length} tunes from the folder.`);
    } else {
      toast.success(`Added ${newTracks.length} tune${newTracks.length === 1 ? "" : "s"} to the queue.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, "drop");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center p-6 md:p-8 rounded-lg text-center transition-colors duration-200 select-none ${
        isDragOver
          ? "bg-surface-sunken border-[3px] border-primary"
          : "bg-surface-raised border-[3px] border-dashed border-primary shadow-sticker"
      } ${compact ? "py-8" : "py-12 md:py-16"}`}
    >
      {/* Hidden File and Folder Pickers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files, "files");
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in browser engines
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files, "folder");
          e.target.value = "";
        }}
      />

      {/* Rooftop Hangout Original Illustration (Lava lamp, speaker, comfy rooftop cushion) */}
      {!compact && (
        <svg
          width="180"
          height="120"
          viewBox="0 0 180 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6 drop-shadow-[2px_2px_0_#1A2A86]"
          aria-hidden="true"
        >
          {/* Wooden Deck Floor Line */}
          <line x1="10" y1="110" x2="170" y2="110" stroke="#1A2A86" strokeWidth="3" strokeLinecap="round" />

          {/* Comfy Rooftop Cushion */}
          <path
            d="M30 110C25 105 28 85 45 85C60 85 85 85 100 85C115 85 120 105 115 110Z"
            fill="#FFF9E0"
            stroke="#1A2A86"
            strokeWidth="2.5"
          />
          {/* Cushion Tuft Buttons in Leaf & Mustard */}
          <circle cx="55" cy="97" r="3" fill="#1F6B3E" stroke="#1A2A86" strokeWidth="1.5" />
          <circle cx="75" cy="97" r="3" fill="#E0A200" stroke="#1A2A86" strokeWidth="1.5" />
          <circle cx="95" cy="97" r="3" fill="#FF8A4C" stroke="#1A2A86" strokeWidth="1.5" />

          {/* Rooftop Speaker */}
          <rect x="125" y="60" width="36" height="50" rx="4" fill="#F0DC8C" stroke="#1A2A86" strokeWidth="2.5" />
          <circle cx="143" cy="74" r="7" fill="#FFF9E0" stroke="#1A2A86" strokeWidth="2" />
          <circle cx="143" cy="95" r="11" fill="#1A2A86" />
          <circle cx="143" cy="95" r="4" fill="#FF8A4C" />

          {/* Lava Lamp on small stool */}
          <rect x="15" y="70" width="16" height="6" rx="2" fill="#3BC6B8" stroke="#1A2A86" strokeWidth="2" />
          <path
            d="M17 70L19 45C19 40 27 40 27 45L29 70Z"
            fill="#FFF9E0"
            stroke="#1A2A86"
            strokeWidth="2"
          />
          <path d="M19 45L21 38H25L27 45Z" fill="#1A2A86" stroke="#1A2A86" strokeWidth="1.5" />
          {/* Lava lamp warm floating blobs (Secondary & Mustard) */}
          <circle cx="23" cy="62" r="3.5" fill="#FF8A4C" />
          <circle cx="22" cy="52" r="2.5" fill="#E0A200" />
          <circle cx="24" cy="45" r="1.5" fill="#FF8A4C" />
        </svg>
      )}

      {/* Main Copy */}
      <h3 className="font-display text-xl md:text-2xl font-bold text-primary mb-2">
        {isDragOver ? "Drop to add" : "Pick some tunes to get started."}
      </h3>
      <p className="font-body text-sm md:text-base text-text-muted max-w-md mb-6 leading-relaxed">
        Your music stays on this device. Browsers do not keep file access across reloads, so add tracks whenever you hang out.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
        >
          Pick tunes
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => folderInputRef.current?.click()}
        >
          Add folder
        </Button>
      </div>
    </div>
  );
}

