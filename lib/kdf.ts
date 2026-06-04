/**
 * KEY DERIVATION — PBKDF2 (and why salt matters)
 *
 * A password like "swordfish" is short, low-entropy, and human. An encryption
 * key needs to be long, uniform, and unguessable. A key-derivation function is
 * the bridge: it stretches a weak password into a strong key.
 *
 * Two ideas do the work:
 *
 *   · SALT — a random value mixed in before hashing. The same password with a
 *     different salt yields a completely different key, which means an attacker
 *     can't precompute one giant table and reuse it against everybody.
 *
 *   · WORK FACTOR — the function is deliberately *slow*, repeating its inner
 *     hash tens of thousands of times. You pay that cost once at login; an
 *     attacker guessing billions of passwords pays it billions of times.
 *
 * PBKDF2 is the KDF built into every browser. Argon2 and scrypt are newer and
 * tougher (they also burn memory, not just time), but the shape is identical.
 */

import { bytesToHex, textToBytes } from "./bytes";

export const DEFAULT_ITERATIONS = 100_000;

/** A fresh random salt — the thing that makes every derivation unique. */
export function randomSalt(bytes = 16): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(bytes));
}

/**
 * Stretch a password + salt into a 256-bit key, returned as hex. More
 * iterations = slower = stronger against guessing.
 */
export async function deriveKeyHex(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<string> {
  const base = await crypto.subtle.importKey(
    "raw",
    textToBytes(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    base,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

/** A salt as hex, for display. */
export function saltHex(salt: Uint8Array): string {
  return bytesToHex(salt);
}

/** Parse a hex string back into salt bytes (for fixed-salt demos). */
export function saltFromHex(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
