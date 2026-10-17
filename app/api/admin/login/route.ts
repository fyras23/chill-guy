import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminPin } from "@/lib/auth/admin-pin";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  getCurrentTimeMs,
} from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter the six-digit admin PIN." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter all six PIN digits." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const [attempt] = await prisma.$queryRaw<Array<{ allowed: boolean }>>`
      SELECT public.reserve_admin_pin_attempt() AS allowed
    `;

    if (attempt?.allowed !== true) {
      return NextResponse.json(
        { error: "Too many guesses. Try again in 15 minutes." },
        {
          status: 429,
          headers: { "Cache-Control": "no-store", "Retry-After": "900" },
        }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { username: "admin" },
      select: { pinHash: true },
    });

    if (!adminUser) {
      throw new Error("Could not load the admin PIN record.");
    }

    if (!(await verifyAdminPin(parsed.data.pin, adminUser.pinHash))) {
      return NextResponse.json(
        { error: "That PIN did not match. Try again." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    await prisma.adminUser.update({
      where: { username: "admin" },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(getCurrentTimeMs()),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",   // "strict" blocks cookies on Vercel's proxied uploadthing requests → 403
        path: "/",
        maxAge: ADMIN_SESSION_TTL_SECONDS,
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Admin PIN sign-in failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Admin sign-in is unavailable. Try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
