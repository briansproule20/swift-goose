/**
 * Low-level byte <-> text conversions shared by the three crypto wrappers.
 * Kept dependency-free: everything here is built into the browser.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** UTF-8 string -> raw bytes (ArrayBuffer-backed, ready for Web Crypto). */
export function textToBytes(text: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(text) as Uint8Array<ArrayBuffer>;
}

/** Raw bytes -> UTF-8 string. */
export function bytesToText(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

/** Bytes -> lowercase hex (e.g. for a SHA-256 digest). */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Bytes -> a binary string of "0"/"1", grouped in bytes. Used by the avalanche demo. */
export function bytesToBits(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("");
}

/** Bytes -> standard Base64 (with padding). */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Base64 -> bytes. Throws on malformed input. */
export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Count how many bits differ between two equal-length bit strings. */
export function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff;
}
