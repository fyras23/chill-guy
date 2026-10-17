"use client";

import React, { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast-store";
import { updateDefaultTrackMetadata } from "@/lib/actions/playlist";
import { parseAudioMetadata } from "@/lib/audio/metadata";
import { Music, UploadCloud } from "lucide-react";

interface PlaylistUploaderProps {
  onUploadComplete: () => void;
}

export function PlaylistUploader({ onUploadComplete }: PlaylistUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("defaultTrackUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
    onUploadError: (err) => {
      setUploadProgress(null);
      console.error("UploadThing client error details:", err);
      toast.error(err.message || "Failed to upload track", "Upload failed");
    },
  });

  const handleFiles = async (files: File[]) => {
    const audioFiles: File[] = [];

    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isAudio =
        file.type.startsWith("audio/") ||
        ["mp3", "m4a", "aac", "wav", "ogg", "flac"].includes(ext);

      if (isAudio) {
        audioFiles.push(file);
      }
    });

    if (audioFiles.length === 0) {
      toast.warning("Please pick audio files (MP3, M4A, WAV, OGG, FLAC).");
      return;
    }

    const tooLargeFiles = audioFiles.filter((f) => f.size > 64 * 1024 * 1024);
    if (tooLargeFiles.length > 0) {
      toast.error(
        `"${tooLargeFiles[0].name}" is larger than 64MB. Maximum track size is 64MB.`,
        "File too large"
      );
      return;
    }

    try {
      // 1. Pre-parse ID3 metadata from files
      const metadataMap = new Map<string, { title: string; artist: string; duration: number }>();
      for (const file of audioFiles) {
        try {
          const parsed = await parseAudioMetadata(file);
          metadataMap.set(file.name, {
            title: parsed.title,
            artist: parsed.artist,
            duration: parsed.duration,
          });
        } catch {
          // Fallback to filename
        }
      }

      // 2. Upload audio files to UploadThing
      const uploaded = await startUpload(audioFiles);
      if (!uploaded || uploaded.length === 0) {
        setUploadProgress(null);
        return;
      }

      // 3. Update track metadata in DB with parsed ID3 tags
      await Promise.all(
        uploaded.map(async (up, index) => {
          const meta = metadataMap.get(up.name) || metadataMap.get(audioFiles[index]?.name);
          const serverData = up.serverData as { trackId?: string } | undefined;
          const trackId = serverData?.trackId;

          if (trackId && meta) {
            await updateDefaultTrackMetadata({
              id: trackId,
              title: meta.title,
              artist: meta.artist,
              duration: meta.duration,
            });
          }
        })
      );

      setUploadProgress(null);
      toast.success(
        uploaded.length === 1
          ? "Added 1 tune to Chill Guy playlist."
          : `Added ${uploaded.length} tunes to Chill Guy playlist.`
      );
      onUploadComplete();
    } catch (err) {
      setUploadProgress(null);
      toast.error((err as Error).message, "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={`relative flex flex-col items-center justify-center p-8 bg-surface-raised border-[3px] rounded-lg text-center select-none transition-colors duration-150 ${
        isDragOver
          ? "bg-surface-sunken border-primary"
          : "border-dashed border-primary shadow-sticker"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary text-primary border-2 border-primary mb-3 shadow-[2px_2px_0_#1A2A86]">
        <UploadCloud className="w-7 h-7" strokeWidth={2.5} />
      </div>

      <h3 className="font-display text-xl font-bold text-primary mb-1">
        {isUploading ? "Uploading tunes..." : "Add Tunes to Chill Guy Playlist"}
      </h3>
      <p className="font-body text-sm text-text-muted max-w-md mb-4 leading-relaxed">
        Upload MP3s to the curated &quot;Chill Guy&quot; default playlist. Anyone visiting the site can stream and listen to these tunes directly.
      </p>

      {isUploading ? (
        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="w-full h-4 bg-surface-sunken border-2 border-primary rounded-pill overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-150"
              style={{ width: `${uploadProgress ?? 10}%` }}
            />
          </div>
          <span className="font-lcd text-sm text-primary font-bold">
            {uploadProgress ? `${uploadProgress}%` : "Processing..."}
          </span>
        </div>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Music className="w-5 h-5 mr-1" strokeWidth={2.5} />
          Pick MP3 tunes
        </Button>
      )}
    </div>
  );
}

