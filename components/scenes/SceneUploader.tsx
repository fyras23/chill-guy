"use client";

import React, { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast-store";
import { updateSceneDimensions } from "@/lib/actions/scenes";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

interface SceneUploaderProps {
  onUploadComplete: () => void;
}

export function SceneUploader({ onUploadComplete }: SceneUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("sceneUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
    onClientUploadComplete: async (res) => {
      setUploadProgress(null);
      if (!res || res.length === 0) return;

      toast.success(res.length === 1 ? "Scene added." : `Added ${res.length} scenes.`);
      onUploadComplete();
    },
    onUploadError: (err) => {
      setUploadProgress(null);
      toast.error(err.message, "Upload failed");
    },
  });

  const handleFiles = async (files: File[]) => {
    const validImageFiles: File[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        validImageFiles.push(file);
      }
    });

    if (validImageFiles.length === 0) {
      toast.warning("Please pick image files (PNG, JPG, WebP).");
      return;
    }

    try {
      // Start upload
      const uploaded = await startUpload(validImageFiles);
      if (!uploaded) return;

      // Measure dimensions for each file and save to Supabase
      for (let i = 0; i < uploaded.length; i++) {
        const up = uploaded[i];
        const originalFile = validImageFiles[i];

        if (originalFile && up.key) {
          try {
            const dimensions = await measureImageFile(originalFile);
            await updateSceneDimensions({
              fileKey: up.key,
              width: dimensions.width,
              height: dimensions.height,
              sizeBytes: originalFile.size,
            });
          } catch (e) {
            console.error("Failed measuring image:", e);
          }
        }
      }

      onUploadComplete();
    } catch (err) {
      toast.error((err as Error).message, "Upload failed");
    }
  };

  const measureImageFile = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image failed to load for dimension measurement"));
      };
      img.src = url;
    });
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
        accept="image/*"
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
        {isUploading ? "Uploading scenes..." : "Add Vibe Scenes"}
      </h3>
      <p className="font-body text-sm text-text-muted max-w-sm mb-4 leading-relaxed">
        Upload high-resolution images (recommended 2560×1440 or higher). They drift across the screen while tunes play.
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
          <ImageIcon className="w-5 h-5 mr-1" strokeWidth={2.5} />
          Choose scenes
        </Button>
      )}
    </div>
  );
}

