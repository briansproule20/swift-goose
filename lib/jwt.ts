/**
 * JSON WEB TOKENS — encoding + signatures, working together
 *
 * A JWT is the synthesis of two things this site already teaches. Take some
 * claims as JSON, Base64URL-*encode* them so they survive a URL header, then
 * *sign* the result so they can't be forged. Three pieces, joined by dots:
 *
 *   base64url(header) . base64url(payload) . base64url(signature)
 *      └─ {alg,typ}       └─ {sub,role,…}      └─ ECDSA over the first two
 *
 * The crucial, constantly-misunderstood point: the first two parts are merely
 * *encoded*, not encrypted. Anyone holding the token can read every claim — go
 * decode one in your browser console. What they cannot do is *change* a claim,
 * because the signature covers the exact bytes of the header and payload. Edit
 * one character and the signature no longer matches.
 *
 * We sign with ES256 (ECDSA over P-256) so it ties straight back to the
 * signatures lesson: the server signs with a private key, and anyone can verify
 * with the public one.
 */

import { base64ToBytes, bytesToBase64, bytesToText, textToBytes } from "./bytes";

export const JWT_HEADER = { alg: "ES256", typ: "JWT" } as const;

const SIGN_PARAMS = { name: "ECDSA", hash: "SHA-256" } as const;

/* ── base64url: standard Base64, made URL-safe and unpadded ── */

function toBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return base64ToBytes(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

/** Encode any JSON-able value as one Base64URL segment. */
export function encodeSegment(value: unknown): string {
  return toBase64Url(textToBytes(JSON.stringify(value)));
}

/** Decode one Base64URL segment back to a value (throws on garbage). */
export function decodeSegment<T = unknown>(segment: string): T {
  return JSON.parse(bytesToText(fromBase64Url(segment))) as T;
}

/** The signing input is the first two segments, joined by a dot. */
function signingInput(payload: unknown): string {
  return `${encodeSegment(JWT_HEADER)}.${encodeSegment(payload)}`;
}

/**
 * Sign a payload with a private key and return only the signature segment
 * (Base64URL). The full token is `signingInput + "." + signature`.
 */
export async function signClaims(
  payload: unknown,
  privateKey: CryptoKey,
): Promise<string> {
  const sig = await crypto.subtle.sign(
    SIGN_PARAMS,
    privateKey,
    textToBytes(signingInput(payload)),
  );
  return toBase64Url(new Uint8Array(sig));
}

/** Assemble a complete, signed token. */
export async function createJwt(
  payload: unknown,
  privateKey: CryptoKey,
): Promise<string> {
  return `${signingInput(payload)}.${await signClaims(payload, privateKey)}`;
}

/**
 * Verify a token against a public key. Recomputes the signing input from the
 * token's own header and payload, so any tampering with either makes the stored
 * signature stop matching. Returns false on a bad signature or malformed token —
 * never throws on untrusted input.
 */
export async function verifyJwt(
  token: string,
  publicKey: CryptoKey,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  let sig: Uint8Array;
  try {
    sig = fromBase64Url(parts[2]);
  } catch {
    return false;
  }
  try {
    return await crypto.subtle.verify(
      SIGN_PARAMS,
      publicKey,
      sig as BufferSource,
      textToBytes(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return false;
  }
}
