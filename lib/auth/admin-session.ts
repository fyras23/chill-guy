import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "chill-guy-admin";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

export function getCurrentTimeMs(): number {
  return Date.now();
}

function getSessionSecret(): Buffer {
  const secretCandidate =
    process.env.ADMIN_SESSION_SECRET?.replace(/^["']|["']$/g, "").trim() ||
    process.env.DATABASE_URL?.replace(/^["']|["']$/g, "").trim() ||
    process.env.UPLOADTHING_TOKEN?.replace(/^["']|["']$/g, "").trim() ||
    "chill-guy-admin-secure-static-salt-key-2026";

  // Derive a consistent 32-byte key via SHA-256 so secrets of any length work reliably
  return createHash("sha256").update(secretCandidate).digest();
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
  } catch (err) {
    console.error("[admin-session] Signature check error:", err);
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
