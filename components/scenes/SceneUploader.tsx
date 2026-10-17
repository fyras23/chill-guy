"use client";

import React, { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast-store";
import { updateSceneDimensions } from "@/lib/actions/scenes";
import { getSceneQuality } from "@/lib/supabase/types";
import { UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";

interface SceneUploaderProps {
  onUploadComplete: () => void;
}

interface ImageDimension {
  width: number;
  height: number;
  sizeBytes: number;
}

export function SceneUploader({ onUploadComplete }: SceneUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("sceneUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
    onUploadError: (err) => {
      setUploadProgress(null);
      toast.error(err.message, "Upload failed");
    },
  });

  const measureImageFile = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        resolve({ width: w, height: h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to read dimensions of ${file.name}`));
      };
      img.src = objectUrl;
    });
  };

  const measureImageUrl = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth || 1920, height: img.naturalHeight || 1080 });
      };
      img.onerror = () => {
        resolve({ width: 1920, height: 1080 });
      };
      img.src = url;
    });
  };

  const handleFiles = async (files: File[]) => {
    const validImageFiles: File[] = [];

    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isImage =
        file.type.startsWith("image/") ||
        ["png", "jpg", "jpeg", "webp", "avif", "tiff"].includes(ext);

      if (isImage) {
        validImageFiles.push(file);
      }
    });

    if (validImageFiles.length === 0) {
      toast.warning("Please pick high-resolution image files (PNG, JPG, WebP, AVIF).");
      return;
    }

    try {
      // 1. Measure native original dimensions before uploading to preserve true resolution
      const dimensionMap = new Map<string, ImageDimension>();
      for (const file of validImageFiles) {
        try {
          const dims = await measureImageFile(file);
          dimensionMap.set(file.name, {
            width: dims.width,
            height: dims.height,
            sizeBytes: file.size,
          });
        } catch {
          // If local blob decode fails, will fallback to measuring remote URL post-upload
        }
      }

      // 2. Upload original uncompressed files to UploadThing
      const uploaded = await startUpload(validImageFiles);
      if (!uploaded || uploaded.length === 0) {
        setUploadProgress(null);
        return;
      }

      let hasLowRes = false;

      // 3. Match each uploaded file and save accurate dimensions & size to Postgres
      await Promise.all(
        uploaded.map(async (up, index) => {
          let dims = dimensionMap.get(up.name) || dimensionMap.get(validImageFiles[index]?.name);

          // If dimensions weren't measured locally, measure from uploaded CDN URL
          if (!dims || !dims.width || !dims.height) {
            const remoteUrl = (up as { ufsUrl?: string; url: string }).ufsUrl || up.url;
            const remoteDims = await measureImageUrl(remoteUrl);
            dims = {
              width: remoteDims.width,
              height: remoteDims.height,
              sizeBytes: up.size || 0,
            };
          }

          if (dims.width && dims.height) {
            const quality = getSceneQuality(dims.width, dims.height);
            if (quality === "low") {
              hasLowRes = true;
            }

            await updateSceneDimensions({
              fileKey: up.key,
              width: dims.width,
              height: dims.height,
              sizeBytes: dims.sizeBytes || up.size,
            });
          }
        })
      );

      setUploadProgress(null);

      // Toast feedback matching DESIGN.md tone rules
      if (uploaded.length === 1) {
        toast.success("Scene added.");
      } else {
        toast.success(`Added ${uploaded.length} scenes.`);
      }

      if (hasLowRes) {
        toast.warning("Low resolution. This will look soft in Vibe mode.");
      }

      onUploadComplete();
    } catch (err) {
      setUploadProgress(null);
      toast.error((err as Error).message, "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
        accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.tiff"
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
        {isUploading ? "Uploading original scenes..." : "Add Vibe Scenes"}
      </h3>
      <p className="font-body text-sm text-text-muted max-w-md mb-2 leading-relaxed">
        Upload high-resolution images. Original quality is preserved without downscaling or re-encoding.
      </p>

      {/* High Quality resolution helper note */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-sunken border border-primary/20 rounded-sm text-xs font-semibold text-text-muted mb-4">
        <Sparkles className="w-3.5 h-3.5 text-secondary" strokeWidth={2.5} />
        <span>Recommend 2560×1440 or 4K (3840×2160) for sharp full-screen drift</span>
      </div>

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
