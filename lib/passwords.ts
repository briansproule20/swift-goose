/**
 * PASSWORD STORAGE — store the proof, never the secret
 *
 * The golden rule: a server should never be able to tell you your own password.
 * It keeps only enough to *check* a guess, not to *recover* the original. So at
 * sign-up you don't store the password — you store a salted, slow hash of it. At
 * login you run the same transform on what they typed and compare.
 *
 * Why salt? Without it, two people with the same password store the identical
 * hash, and an attacker precomputes one "rainbow table" of common-password
 * hashes and cracks everyone at once. A unique salt per user makes every stored
 * hash different, so that whole shortcut collapses — each guess must be tried
 * against each user, slowly.
 *
 * We use PBKDF2 here (built into the browser). Real systems prefer bcrypt,
 * scrypt, or Argon2, but the storage shape is the same.
 */

import { base64ToBytes, bytesToBase64 } from "./bytes";
import { sha256Hex } from "./hash";
import { deriveKeyHex, randomSalt } from "./kdf";

const ITERATIONS = 100_000;

/**
 * Turn a password into a self-contained storage record:
 *   pbkdf2$<iterations>$<saltB64>$<hashHex>
 * The salt is stored in the clear — it isn't a secret, it's an anti-shortcut.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt(16);
  const hash = await deriveKeyHex(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${bytesToBase64(salt)}$${hash}`;
}

/** Check a password against a stored record. Never reveals the original. */
export async function verifyPassword(
  password: string,
  record: string,
): Promise<boolean> {
  const parts = record.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  let salt: Uint8Array;
  try {
    salt = base64ToBytes(parts[2]);
  } catch {
    return false;
  }
  const expected = parts[3];
  const actual = await deriveKeyHex(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}

/** Length-constant string compare, so timing doesn't leak how close a guess was. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ------------------------------------------------------------------ *
 *  The naive (broken) approach, for contrast — and a rainbow table
 * ------------------------------------------------------------------ */

/** The wrong way: a bare, unsalted hash. Deterministic, so it's table-able. */
export async function naiveHashHex(password: string): Promise<string> {
  return sha256Hex(password);
}

/** The passwords an attacker tries first — the top of every breach list. */
export const COMMON_PASSWORDS = [
  "123456",
  "password",
  "qwerty",
  "letmein",
  "password123",
  "abc123",
  "iloveyou",
  "admin",
  "welcome",
  "monkey",
];

/**
 * A rainbow table: every common password mapped to its unsalted SHA-256.
 * Build it once, then any naive hash of a common password reverses instantly.
 */
export async function buildRainbowTable(): Promise<Map<string, string>> {
  const table = new Map<string, string>();
  await Promise.all(
    COMMON_PASSWORDS.map(async (pw) => {
      table.set(await sha256Hex(pw), pw);
    }),
  );
  return table;
}
