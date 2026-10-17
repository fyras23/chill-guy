import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  getCurrentTimeMs,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

export async function verifyAdminUser(): Promise<{
  isAdmin: boolean;
  email: string | null;
}> {
  const cookieStore = await cookies();
  const isAdmin = verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
    getCurrentTimeMs()
  );

  return { isAdmin, email: isAdmin ? "admin" : null };
}
