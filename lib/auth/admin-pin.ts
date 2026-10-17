import { scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

export function verifyAdminPin(pin: string, storedHash: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, saltHex, digestHex, ...rest] =
    storedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    cost !== String(SCRYPT_N) ||
    blockSize !== String(SCRYPT_R) ||
    parallelization !== String(SCRYPT_P) ||
    !/^[a-f0-9]{32}$/.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/.test(digestHex ?? "") ||
    rest.length > 0
  ) {
    throw new Error("The stored admin PIN hash is invalid.");
  }

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(digestHex, "hex");

  return new Promise((resolve, reject) => {
    scrypt(
      pin,
      salt,
      expected.length,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: SCRYPT_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(timingSafeEqual(derivedKey, expected));
      }
    );
  });
}
