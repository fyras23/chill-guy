"use server";

import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { verifyAdminUser } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/prisma";
import type { Scene } from "@/lib/supabase/types";

// Zod schemas for input validation
const updateDimensionsSchema = z.object({
  fileKey: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

const renameSceneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
});

const toggleSceneActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const reorderScenesSchema = z
  .array(z.string().uuid())
  .refine((ids) => new Set(ids).size === ids.length);

const deleteSceneSchema = z.object({
  id: z.string().uuid(),
  fileKey: z.string().min(1),
});

/**
 * Fetch all active scenes for public player.
 */
export async function getActiveScenes(): Promise<Scene[]> {
  try {
    const scenes = await prisma.scene.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return scenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      url: scene.url,
      file_key: scene.fileKey,
      width: scene.width,
      height: scene.height,
      size_bytes: scene.sizeBytes === null ? null : Number(scene.sizeBytes),
      sort_order: scene.sortOrder,
      is_active: scene.isActive,
      created_at: scene.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to load active scenes:", error);
    return [];
  }
}

/**
 * Fetch all scenes (active and inactive) for admin manager.
 */
export async function getAllScenesAdmin(): Promise<Scene[]> {
  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const scenes = await prisma.scene.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return scenes.map((scene) => ({
    id: scene.id,
    name: scene.name,
    url: scene.url,
    file_key: scene.fileKey,
    width: scene.width,
    height: scene.height,
    size_bytes: scene.sizeBytes === null ? null : Number(scene.sizeBytes),
    sort_order: scene.sortOrder,
    is_active: scene.isActive,
    created_at: scene.createdAt.toISOString(),
  }));
}

/**
 * Store measured image dimensions after client upload.
 */
export async function updateSceneDimensions(input: z.infer<typeof updateDimensionsSchema>) {
  const parsed = updateDimensionsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid dimensions input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData = {
      width: parsed.data.width,
      height: parsed.data.height,
      ...(parsed.data.sizeBytes !== undefined && {
        sizeBytes: BigInt(parsed.data.sizeBytes),
      }),
    };

    await prisma.scene.update({
      where: { fileKey: parsed.data.fileKey },
      data: updateData,
    });

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Rename a scene.
 */
export async function renameScene(input: z.infer<typeof renameSceneSchema>) {
  const parsed = renameSceneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid name input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.scene.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    });

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Toggle a scene's active state.
 */
export async function toggleSceneActive(input: z.infer<typeof toggleSceneActiveSchema>) {
  const parsed = toggleSceneActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid toggle input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.scene.update({
      where: { id: parsed.data.id },
      data: { isActive: parsed.data.isActive },
    });

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Reorder scenes.
 */
export async function reorderScenes(orderedIds: z.infer<typeof reorderScenesSchema>) {
  const parsed = reorderScenesSchema.safeParse(orderedIds);
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
        prisma.scene.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Delete a scene from both UploadThing storage and Supabase database.
 */
export async function deleteScene(input: z.infer<typeof deleteSceneSchema>) {
  const parsed = deleteSceneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid delete input" };
  }

  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Delete from UploadThing
    const utapi = new UTApi();
    await utapi.deleteFiles(parsed.data.fileKey);

    // 2. Delete the scene metadata from Postgres.
    await prisma.scene.delete({
      where: { id: parsed.data.id },
    });

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
