"use server";

import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { verifyAdminUser } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/prisma";

export interface DefaultTrackDTO {
  id: string;
  title: string;
  artist: string;
  url: string;
  file_key: string;
  duration: number;
  cover_url: string | null;
  size_bytes: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const updateMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  duration: z.number().int().nonnegative().optional(),
});

const toggleActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const reorderSchema = z.array(z.string().uuid());

const deleteTrackSchema = z.object({
  id: z.string().uuid(),
  fileKey: z.string().min(1),
});

/**
 * Fetch all active tracks from the "Chill Guy" default playlist for public playback.
 */
export async function getPublicDefaultPlaylist(): Promise<DefaultTrackDTO[]> {
  try {
    const tracks = await prisma.defaultTrack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      url: t.url,
      file_key: t.fileKey,
      duration: t.duration,
      cover_url: t.coverUrl,
      size_bytes: t.sizeBytes === null ? null : Number(t.sizeBytes),
      sort_order: t.sortOrder,
      is_active: t.isActive,
      created_at: t.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load public default playlist:", err);
    return [];
  }
}

/**
 * Fetch all tracks from the "Chill Guy" playlist for admin management.
 */
export async function getAllDefaultTracksAdmin(): Promise<DefaultTrackDTO[]> {
  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const tracks = await prisma.defaultTrack.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    url: t.url,
    file_key: t.fileKey,
    duration: t.duration,
    cover_url: t.coverUrl,
    size_bytes: t.sizeBytes === null ? null : Number(t.sizeBytes),
    sort_order: t.sortOrder,
    is_active: t.isActive,
    created_at: t.createdAt.toISOString(),
  }));
}

/**
 * Update a track's title, artist, or duration.
 */
export async function updateDefaultTrackMetadata(
  input: z.infer<typeof updateMetadataSchema>
) {
  const parsed = updateMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid metadata input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.defaultTrack.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        artist: parsed.data.artist,
        ...(parsed.data.duration !== undefined && { duration: parsed.data.duration }),
      },
    });

    revalidateTag("default_tracks", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Toggle a track active/inactive.
 */
export async function toggleDefaultTrackActive(
  input: z.infer<typeof toggleActiveSchema>
) {
  const parsed = toggleActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid toggle input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.defaultTrack.update({
      where: { id: parsed.data.id },
      data: { isActive: parsed.data.isActive },
    });

    revalidateTag("default_tracks", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Reorder tracks in the default playlist.
 */
export async function reorderDefaultTracks(orderedIds: z.infer<typeof reorderSchema>) {
  const parsed = reorderSchema.safeParse(orderedIds);
  if (!parsed.success) {
    return { error: "Invalid order input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(
      parsed.data.map((id, index) =>
        prisma.defaultTrack.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidateTag("default_tracks", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Delete a track from UploadThing storage and the database.
 */
export async function deleteDefaultTrack(input: z.infer<typeof deleteTrackSchema>) {
  const parsed = deleteTrackSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid delete input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(parsed.data.fileKey);

    await prisma.defaultTrack.delete({
      where: { id: parsed.data.id },
    });

    revalidateTag("default_tracks", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

