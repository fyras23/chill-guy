import { randomBytes, scryptSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyAdminPin } from "../admin-pin";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  hasValidAdminSessionSignature,
  verifyAdminSessionToken,
} from "../admin-session";

function makePinHash(pin: string): string {
  const salt = randomBytes(16);
  const digest = scryptSync(pin, salt, 64, {
    N: 32_768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

  return [
    "scrypt",
    "32768",
    "8",
    "1",
    salt.toString("hex"),
    digest.toString("hex"),
  ].join("$");
}

describe("admin PIN verification", () => {
  it("accepts the matching PIN and rejects a different PIN", async () => {
    const hash = makePinHash("123456");

    await expect(verifyAdminPin("123456", hash)).resolves.toBe(true);
    await expect(verifyAdminPin("123457", hash)).resolves.toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(() => verifyAdminPin("123456", "not-a-hash")).toThrow(
      "The stored admin PIN hash is invalid."
    );
  });
});

describe("admin session tokens", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret-that-is-long-enough");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a valid signature until the session expires", () => {
    const now = 1_800_000_000_000;
    const token = createAdminSessionToken(now);

    expect(hasValidAdminSessionSignature(token)).toBe(true);
    expect(verifyAdminSessionToken(token, now)).toBe(true);
    expect(
      verifyAdminSessionToken(
        token,
        now + ADMIN_SESSION_TTL_SECONDS * 1000
      )
    ).toBe(false);
  });

  it("rejects tampered and malformed tokens", () => {
    const token = createAdminSessionToken(1_800_000_000_000);
    const [expiry, signature] = token.split(".");

    expect(hasValidAdminSessionSignature(`${expiry}.${signature.slice(1)}`)).toBe(
      false
    );
    expect(hasValidAdminSessionSignature("not-a-session")).toBe(false);
    expect(
      verifyAdminSessionToken(`${expiry}.${signature.slice(1)}`, 1_800_000_000_000)
    ).toBe(false);
    expect(verifyAdminSessionToken("not-a-session", 1_800_000_000_000)).toBe(
      false
    );
  });
});
