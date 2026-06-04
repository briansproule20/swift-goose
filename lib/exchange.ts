/**
 * KEY EXCHANGE — ECDH over P-256, plus the toy modular arithmetic underneath
 *
 * The oldest problem in cryptography: two strangers want a shared secret, but
 * everything they say travels over a wire the whole world can read. Diffie and
 * Hellman's 1976 answer feels like a magic trick — each side mixes a private
 * number with a public one, swaps the results in the open, and they both arrive
 * at the same secret that an eavesdropper *cannot* reconstruct.
 *
 * This file has two layers:
 *   1. A tiny modular-arithmetic version (small numbers, BigInt) so you can
 *      watch the trick happen by hand.
 *   2. The real thing your browser ships: ECDH on the P-256 curve, where the
 *      "hard to reverse" step is the elliptic-curve discrete logarithm.
 */

import { bytesToHex } from "./bytes";

/* ------------------------------------------------------------------ *
 *  Layer 1 — the textbook trick, with numbers small enough to follow
 * ------------------------------------------------------------------ */

const ZERO = BigInt(0);
const ONE = BigInt(1);

/** Fast modular exponentiation: base^exp mod m, without overflowing. */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = ONE;
  base %= mod;
  while (exp > ZERO) {
    if (exp & ONE) result = (result * base) % mod;
    exp >>= ONE;
    base = (base * base) % mod;
  }
  return result;
}

export interface ToyExchange {
  /** Alice's public value A = g^a mod p (sent in the clear). */
  alicePublic: bigint;
  /** Bob's public value B = g^b mod p (sent in the clear). */
  bobPublic: bigint;
  /** What Alice computes: B^a mod p. */
  aliceShared: bigint;
  /** What Bob computes: A^b mod p. They are equal — that's the point. */
  bobShared: bigint;
  agree: boolean;
}

/**
 * Run the toy exchange for a common base `g`, prime modulus `p`, and the two
 * private exponents. Returns the public values both sides broadcast and the
 * shared secret each independently derives.
 */
export function toyExchange(
  g: bigint,
  p: bigint,
  a: bigint,
  b: bigint,
): ToyExchange {
  const alicePublic = modPow(g, a, p);
  const bobPublic = modPow(g, b, p);
  const aliceShared = modPow(bobPublic, a, p); // B^a mod p
  const bobShared = modPow(alicePublic, b, p); // A^b mod p
  return {
    alicePublic,
    bobPublic,
    aliceShared,
    bobShared,
    agree: aliceShared === bobShared,
  };
}

/**
 * The eavesdropper's job: she has g, p, A, B and wants the secret. Her only
 * route is to recover a private exponent by brute force — the discrete log.
 * We return how many guesses it took for these toy numbers, to make the point
 * that with real-world sizes this count is astronomically large.
 */
export function discreteLogBruteForce(
  g: bigint,
  p: bigint,
  publicValue: bigint,
): { exponent: bigint; tries: number } | null {
  let acc = ONE;
  for (let x = ONE, tries = 1; x < p; x++, tries++) {
    acc = (acc * g) % p;
    if (acc === publicValue) return { exponent: x, tries };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 *  Layer 2 — the real thing: ECDH on P-256, what your browser uses
 * ------------------------------------------------------------------ */

const ECDH = { name: "ECDH", namedCurve: "P-256" } as const;

/** A fresh ECDH key pair (one per participant). */
export async function generateExchangeKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ECDH, true, [
    "deriveBits",
  ]) as Promise<CryptoKeyPair>;
}

/** Raw bytes of a public key — the value sent across the open wire. */
export async function exportPublicBytes(
  publicKey: CryptoKey,
): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.exportKey("raw", publicKey));
}

/**
 * Derive the shared secret from *my* private key and *your* public key. Run on
 * both sides with the keys swapped, it produces identical bytes.
 */
export async function deriveSharedSecret(
  myPrivate: CryptoKey,
  theirPublic: CryptoKey,
): Promise<Uint8Array> {
  const bits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: theirPublic },
    myPrivate,
    256,
  );
  return new Uint8Array(bits);
}

/** A grouped-hex fingerprint of a secret or public key, for display. */
export function fingerprint(bytes: Uint8Array, hexChars = 24): string {
  return bytesToHex(bytes)
    .slice(0, hexChars)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
