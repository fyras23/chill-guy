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
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const now = getCurrentTimeMs();
  const isAdmin = verifyAdminSessionToken(token, now);

  if (!isAdmin && process.env.NODE_ENV === "production") {
    console.warn("[verifyAdminUser] Unauthorized attempt:", {
      hasCookie: Boolean(token),
      tokenPrefix: token ? token.slice(0, 8) : null,
    });
  }

  return { isAdmin, email: isAdmin ? "admin" : null };
}
