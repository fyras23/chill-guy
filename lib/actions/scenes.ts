"use server";

import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { verifyAdminUser } from "@/lib/auth/admin-check";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
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

const reorderScenesSchema = z.array(z.string().uuid());

const deleteSceneSchema = z.object({
  id: z.string().uuid(),
  fileKey: z.string().min(1),
});

/**
 * Fetch all active scenes for public player.
 */
export async function getActiveScenes(): Promise<Scene[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("scenes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return [];
    }

    return (data as Scene[]) || [];
  } catch {
    return [];
  }
}

/**
 * Fetch all scenes (active and inactive) for admin manager.
 */
export async function getAllScenesAdmin(): Promise<Scene[]> {
  const { isAdmin } = await verifyAdminUser();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin email required");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load scenes: ${error.message}`);
  }

  return (data as Scene[]) || [];
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
    const supabase = createAdminClient();
    const updateData: Record<string, unknown> = {
      width: parsed.data.width,
      height: parsed.data.height,
    };
    if (parsed.data.sizeBytes !== undefined) {
      updateData.size_bytes = parsed.data.sizeBytes;
    }

    const { error } = await supabase
      .from("scenes")
      .update(updateData)
      .eq("file_key", parsed.data.fileKey);

    if (error) {
      return { error: error.message };
    }

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
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("scenes")
      .update({ name: parsed.data.name })
      .eq("id", parsed.data.id);

    if (error) {
      return { error: error.message };
    }

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
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("scenes")
      .update({ is_active: parsed.data.isActive })
      .eq("id", parsed.data.id);

    if (error) {
      return { error: error.message };
    }

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
    const supabase = createAdminClient();
    // Update sort_order for each ID
    for (let index = 0; index < parsed.data.length; index++) {
      const id = parsed.data[index];
      await supabase.from("scenes").update({ sort_order: index }).eq("id", id);
    }

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

    // 2. Delete from Supabase
    const supabase = createAdminClient();
    const { error } = await supabase.from("scenes").delete().eq("id", parsed.data.id);

    if (error) {
      return { error: error.message };
    }

    revalidateTag("scenes", "max");
    revalidatePath("/");
    revalidatePath("/scenes");
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

