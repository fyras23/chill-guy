import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getCurrentTimeMs,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/scenes")) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifyAdminSessionToken(session, getCurrentTimeMs())) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/scenes", "/scenes/:path*"],
};
