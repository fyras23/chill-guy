import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { verifyAdminUser } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  sceneUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 20,
    },
  })
    .middleware(async () => {
      const { isAdmin, email } = await verifyAdminUser();
      if (!isAdmin) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Unauthorized: Admin access required",
        });
      }
      return { userEmail: email };
    })
    .onUploadComplete(async ({ file }) => {
      // Use ufsUrl if present in UploadThing v7+, fallback to url
      const fileRecord = file as { ufsUrl?: string; url: string; key: string; name: string };
      const fileUrl = fileRecord.ufsUrl || fileRecord.url;
      const fileKey = fileRecord.key;
      const fileName = fileRecord.name.replace(/\.[^/.]+$/, "");

      try {
        const lastScene = await prisma.scene.findFirst({
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        const nextOrder = (lastScene?.sortOrder ?? -1) + 1;

        const createdScene = await prisma.scene.create({
          data: {
            name: fileName,
            url: fileUrl,
            fileKey: fileKey,
            sortOrder: nextOrder,
            isActive: true,
          },
        });

        return { sceneId: createdScene.id, fileKey };
      } catch (err) {
        console.error("Error in onUploadComplete for scene:", err);
        return { fileKey };
      }
    }),

  defaultTrackUploader: f({
    audio: {
      maxFileSize: "64MB",
      maxFileCount: 20,
    },
    blob: {
      maxFileSize: "64MB",
      maxFileCount: 20,
    },
  })
    .middleware(async () => {
      const { isAdmin, email } = await verifyAdminUser();
      if (!isAdmin) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Unauthorized: Admin access required",
        });
      }
      return { userEmail: email };
    })
    .onUploadComplete(async ({ file }) => {
      const fileRecord = file as { ufsUrl?: string; url: string; key: string; name: string };
      const fileUrl = fileRecord.ufsUrl || fileRecord.url;
      const fileKey = fileRecord.key;
      const fileName = fileRecord.name.replace(/\.[^/.]+$/, "");

      try {
        const lastTrack = await prisma.defaultTrack.findFirst({
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        const nextOrder = (lastTrack?.sortOrder ?? -1) + 1;

        const createdTrack = await prisma.defaultTrack.create({
          data: {
            title: fileName,
            artist: "Chill Guy",
            url: fileUrl,
            fileKey: fileKey,
            sortOrder: nextOrder,
            isActive: true,
          },
        });

        return { trackId: createdTrack.id, fileKey };
      } catch (err) {
        console.error("Error in defaultTrackUploader onUploadComplete:", err);
        return { fileKey };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
