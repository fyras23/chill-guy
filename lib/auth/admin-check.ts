import { createClient } from "@/lib/supabase/server";

export async function verifyAdminUser(): Promise<{ isAdmin: boolean; email?: string | null }> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return { isAdmin: false };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user || !data.user.email) {
      return { isAdmin: false };
    }

    const userEmail = data.user.email.trim().toLowerCase();
    const isAdmin = userEmail === adminEmail;

    return { isAdmin, email: userEmail };
  } catch {
    return { isAdmin: false };
  }
}

