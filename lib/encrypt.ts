/**
 * ENCRYPTION — AES-GCM (256-bit)
 *
 * Two-way scrambling that needs the right key to undo. Its job is *secrecy
 * with recovery*. Unlike hashing, it is reversible — but ONLY for whoever
 * holds the key. Feed in the wrong key and decryption doesn't return garbage,
 * it *fails*: GCM authenticates the ciphertext, so a wrong key is detected.
 * That failure is the whole point.
 *
 * To keep the demo tactile we let the learner type a human passphrase and
 * derive the AES key from it with PBKDF2. A fresh random salt + IV are
 * generated per encryption and packed alongside the ciphertext, so the same
 * passphrase still produces different-looking output every time (as it should).
 *
 * Packed blob layout (then Base64-encoded for display):
 *   [ salt: 16 bytes ][ iv: 12 bytes ][ ciphertext + GCM tag ]
 */

import { base64ToBytes, bytesToBase64, bytesToText, textToBytes } from "./bytes";

const SALT_BYTES = 16;
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100_000;

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textToBytes(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt UTF-8 text with a passphrase. Returns a self-contained Base64 blob. */
export async function encryptText(
  plaintext: string,
  passphrase: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    textToBytes(plaintext),
  );
  const cipher = new Uint8Array(cipherBuffer);

  const blob = new Uint8Array(salt.length + iv.length + cipher.length);
  blob.set(salt, 0);
  blob.set(iv, salt.length);
  blob.set(cipher, salt.length + iv.length);
  return bytesToBase64(blob);
}

export type DecryptResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/**
 * Decrypt a blob produced by {@link encryptText}. A wrong passphrase, or any
 * tampering with the ciphertext, surfaces as a clean failure rather than
 * silent garbage — that's GCM's authentication doing its job.
 */
export async function decryptText(
  blobBase64: string,
  passphrase: string,
): Promise<DecryptResult> {
  let blob: Uint8Array;
  try {
    blob = base64ToBytes(blobBase64.trim());
  } catch {
    return { ok: false, error: "That isn't a valid ciphertext blob." };
  }
  if (blob.length <= SALT_BYTES + IV_BYTES) {
    return { ok: false, error: "Ciphertext is too short to be valid." };
  }

  const salt = blob.slice(0, SALT_BYTES);
  const iv = blob.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const cipher = blob.slice(SALT_BYTES + IV_BYTES);

  try {
    const key = await deriveKey(passphrase, salt);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      cipher as BufferSource,
    );
    return { ok: true, text: bytesToText(new Uint8Array(plainBuffer)) };
  } catch {
    return {
      ok: false,
      error: "Wrong key. Decryption failed — and that's exactly the point.",
    };
  }
}

/** Generate a random, shareable passphrase suggestion for the playground. */
export function suggestPassphrase(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return bytesToBase64(bytes).replace(/[+/=]/g, "").slice(0, 12);
}
