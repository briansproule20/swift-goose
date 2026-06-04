/**
 * ENCODING — Base64
 *
 * Reversible by anyone, no key required. Its job is *safe transport*:
 * turning arbitrary bytes into a 64-character alphabet that survives email,
 * URLs and JSON. It is emphatically NOT secrecy.
 *
 * We go through TextEncoder/TextDecoder so that non-ASCII input (emoji,
 * accents, any Unicode) round-trips correctly — naive btoa(str) would throw.
 */

import { base64ToBytes, bytesToBase64, bytesToText, textToBytes } from "./bytes";

/** Encode UTF-8 text to Base64. Always succeeds. */
export function encodeBase64(text: string): string {
  return bytesToBase64(textToBytes(text));
}

export type DecodeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/**
 * Decode Base64 back to text. Returns a discriminated result rather than
 * throwing, so the UI can show *why* malformed input failed — which is itself
 * a teaching moment ("this isn't valid Base64").
 */
export function decodeBase64(b64: string): DecodeResult {
  try {
    const bytes = base64ToBytes(b64.trim());
    return { ok: true, text: bytesToText(bytes) };
  } catch {
    return { ok: false, error: "Not valid Base64 — wrong alphabet or padding." };
  }
}

/** The ~33% size overhead Base64 adds (4 output chars per 3 input bytes). */
export function base64Overhead(text: string): {
  inputBytes: number;
  outputChars: number;
  ratio: number;
} {
  const inputBytes = textToBytes(text).length;
  const outputChars = encodeBase64(text).length;
  return {
    inputBytes,
    outputChars,
    ratio: inputBytes === 0 ? 0 : outputChars / inputBytes,
  };
}
