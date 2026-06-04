/**
 * HASHING — SHA-256
 *
 * A one-way fingerprint: deterministic, fixed-length (256 bits / 64 hex
 * chars), and irreversible. No key. Its job is *integrity and identity* —
 * proving data hasn't changed, not hiding it.
 *
 * The signature property is the avalanche effect: flip one input bit and
 * roughly half the output bits flip, with no correlation to the change.
 */

import { bytesToBits, bytesToHex, textToBytes } from "./bytes";

/** SHA-256 of UTF-8 text -> lowercase hex string (64 chars). */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textToBytes(text));
  return bytesToHex(new Uint8Array(digest));
}

/** SHA-256 of UTF-8 text -> 256-character bit string. Used for the avalanche demo. */
export async function sha256Bits(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textToBytes(text));
  return bytesToBits(new Uint8Array(digest));
}

/** Raw digest bytes, if you want to format them yourself. */
export async function sha256Bytes(text: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", textToBytes(text));
  return new Uint8Array(digest);
}
