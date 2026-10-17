import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
