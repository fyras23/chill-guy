import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "chill-guy-admin";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

export function getCurrentTimeMs(): number {
  return performance.timeOrigin + performance.now();
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function signExpiry(expiry: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(expiry)
    .digest("hex");
}

export function createAdminSessionToken(now: number): string {
  const expiry = String(
    Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS
  );
  return `${expiry}.${signExpiry(expiry)}`;
}

export function hasValidAdminSessionSignature(
  token: string | undefined
): boolean {
  if (!token) return false;

  const [expiry, signature, ...rest] = token.split(".");
  if (
    rest.length > 0 ||
    !/^\d+$/.test(expiry ?? "") ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(signExpiry(expiry), "hex");
    const actual = Buffer.from(signature, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function verifyAdminSessionToken(
  token: string | undefined,
  now: number
): boolean {
  if (!hasValidAdminSessionSignature(token)) return false;

  const expiry = Number(token?.split(".")[0]);
  return expiry > Math.floor(now / 1000);
}
