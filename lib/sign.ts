/**
 * DIGITAL SIGNATURES — ECDSA over P-256 (the curve TLS, SSH, and Bitcoin lean on)
 *
 * A signature answers two questions encryption can't: *who* produced this, and
 * has it been altered since? It is NOT secrecy — a signed message is still
 * readable by anyone. It's a proof, gated by a key you keep private and a key
 * you hand out freely.
 *
 * The shape:
 *   sign:   signature = ECDSA( SHA-256(message), privateKey )
 *   verify: ECDSA-verify( SHA-256(message), signature, publicKey ) -> yes / no
 *
 * Only the private key can produce a signature that the matching public key
 * accepts. Change one byte of the message and the digest changes, so the old
 * signature no longer matches — the verify fails. Sign with the wrong private
 * key and it fails too. That's authenticity and integrity in one move.
 */

import { bytesToBase64, bytesToHex, textToBytes } from "./bytes";

const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN_PARAMS = { name: "ECDSA", hash: "SHA-256" } as const;

/** A fresh ECDSA key pair. The public key is extractable so we can show it. */
export async function generateSigningKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ALGORITHM, true, [
    "sign",
    "verify",
  ]) as Promise<CryptoKeyPair>;
}

/** Sign UTF-8 text with a private key. Returns a Base64 signature. */
export async function signText(
  message: string,
  privateKey: CryptoKey,
): Promise<string> {
  const sig = await crypto.subtle.sign(
    SIGN_PARAMS,
    privateKey,
    textToBytes(message),
  );
  return bytesToBase64(new Uint8Array(sig));
}

/**
 * Check a Base64 signature against a message and a public key. Returns true
 * only when this exact message was signed by the private key paired with this
 * public key. Any tampering, or the wrong key, returns false — never throws on
 * a bad signature, only on genuinely malformed input.
 */
export async function verifyText(
  message: string,
  signatureBase64: string,
  publicKey: CryptoKey,
): Promise<boolean> {
  let sig: Uint8Array;
  try {
    sig = base64ToBytesStrict(signatureBase64);
  } catch {
    return false;
  }
  try {
    return await crypto.subtle.verify(
      SIGN_PARAMS,
      publicKey,
      sig as BufferSource,
      textToBytes(message),
    );
  } catch {
    return false;
  }
}

/**
 * A short, human-readable fingerprint of a public key — the SHA-256 of its raw
 * point, grouped into hex. This is morally what a certificate fingerprint is:
 * a stable handle for "this exact key".
 */
export async function publicKeyFingerprint(
  publicKey: CryptoKey,
): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", publicKey);
  const digest = await crypto.subtle.digest("SHA-256", raw);
  const hex = bytesToHex(new Uint8Array(digest)).slice(0, 32);
  return hex.replace(/(.{4})/g, "$1 ").trim();
}

/** The raw public key as hex, truncated — for showing "the key you hand out". */
export async function publicKeyHex(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", publicKey);
  return bytesToHex(new Uint8Array(raw));
}

// Local strict Base64 decode (atob throws on garbage; we want that signal).
function base64ToBytesStrict(b64: string): Uint8Array {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
