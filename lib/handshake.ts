/**
 * THE TLS 1.3 HANDSHAKE — the capstone, where every primitive shows up at once
 *
 * No new math here. A handshake is *choreography*: it takes the building blocks
 * you've already met and arranges them so two strangers end up sharing one
 * secret key, each sure of who the other is, with an eavesdropper left holding
 * nothing useful.
 *
 *   · KEY EXCHANGE (ECDH)  — both sides derive the same secret over the open wire
 *   · SIGNATURES (ECDSA)   — the server proves it owns its certificate
 *   · HASHING (HKDF/SHA-256) — the raw secret is stretched into real session keys
 *   · ENCRYPTION (AES-GCM) — from here on, everything is sealed
 *
 * This runs for real, in your browser. Every value below is computed — the
 * randoms, the public keys, the signature, the shared secret, the session key,
 * and a genuinely encrypted first request. Nothing is faked, and nothing leaves
 * the page.
 */

import { bytesToBase64, bytesToHex, bytesToText, textToBytes } from "./bytes";
import {
  deriveSharedSecret,
  exportPublicBytes,
  fingerprint,
  generateExchangeKeyPair,
} from "./exchange";
import { generateSigningKeyPair, publicKeyFingerprint, signText, verifyText } from "./sign";

export type StepSide = "client" | "server" | "wire" | "both";
export type StepPrimitive = "hash" | "sign" | "exchange" | "encrypt" | null;

export interface HandshakeStep {
  id: string;
  /** TLS record name, kept close to the real protocol. */
  record: string;
  title: string;
  side: StepSide;
  /** Which primitive lesson this step draws on (drives the colored chip + link). */
  primitive: StepPrimitive;
  detail: string;
  /** A real, computed value — truncated for display. */
  value?: string;
  /** True for the impersonation-detected abort step. */
  failure?: boolean;
}

export interface HandshakeResult {
  ok: boolean;
  steps: HandshakeStep[];
  serverIdentityFingerprint: string;
  sessionKeyFingerprint: string | null;
  request: string;
  ciphertext: string | null;
  decrypted: string | null;
}

const DEFAULT_REQUEST = "GET / HTTP/1.1\r\nHost: saltworks.dev";

function randomHex(bytes: number): { raw: Uint8Array; hex: string } {
  const raw = crypto.getRandomValues(new Uint8Array(bytes));
  return { raw, hex: bytesToHex(raw) };
}

function trunc(hex: string, chars = 24): string {
  return hex
    .slice(0, chars)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/**
 * Run one full handshake.
 *
 * @param opts.tamper  When true, an attacker presents the real server's
 *   certificate but can't sign for it — so they sign with their *own* key. The
 *   client's signature check fails and the handshake aborts before any secret
 *   is shared. That abort is the whole security guarantee, made visible.
 */
export async function runHandshake(
  opts: { tamper?: boolean; request?: string } = {},
): Promise<HandshakeResult> {
  const request = opts.request ?? DEFAULT_REQUEST;
  const steps: HandshakeStep[] = [];

  // ── The server's long-term identity: its certificate key pair (ECDSA) ──
  const serverIdentity = await generateSigningKeyPair();
  const serverIdentityFingerprint = await publicKeyFingerprint(
    serverIdentity.publicKey,
  );

  // ── Ephemeral key-exchange pairs, fresh for this one connection ──
  const clientEph = await generateExchangeKeyPair();
  const serverEph = await generateExchangeKeyPair();
  const clientEphPub = await exportPublicBytes(clientEph.publicKey);
  const serverEphPub = await exportPublicBytes(serverEph.publicKey);

  const clientRandom = randomHex(32);
  const serverRandom = randomHex(32);

  // 1 — ClientHello
  steps.push({
    id: "client-hello",
    record: "ClientHello",
    title: "Client opens with a random + an ephemeral public key",
    side: "client",
    primitive: "exchange",
    detail:
      "The client invents a one-time ECDH key pair for this connection and sends its public half, plus 32 random bytes. Nothing secret has crossed the wire.",
    value: trunc(bytesToHex(clientEphPub)),
  });

  // 2 — ServerHello
  steps.push({
    id: "server-hello",
    record: "ServerHello",
    title: "Server answers with its own random + ephemeral public key",
    side: "server",
    primitive: "exchange",
    detail:
      "The server does the same — its own one-time ECDH public key and 32 random bytes. Both halves of the key exchange are now in the open.",
    value: trunc(bytesToHex(serverEphPub)),
  });

  // 3 — Certificate
  steps.push({
    id: "certificate",
    record: "Certificate",
    title: "Server presents its certificate",
    side: "server",
    primitive: "sign",
    detail:
      "The certificate is the server's long-term public key, vouched for by a certificate authority. Its fingerprint is a stable handle for 'this exact server'.",
    value: serverIdentityFingerprint,
  });

  // 4 — CertificateVerify: server signs the transcript with its identity key.
  // (In a real impersonation, the attacker holds the cert but not its private
  //  key, so they're forced to sign with a key that doesn't match.)
  const transcript =
    clientRandom.hex + serverRandom.hex + bytesToHex(serverEphPub);
  const signingKey = opts.tamper
    ? (await generateSigningKeyPair()).privateKey // attacker's key ≠ the cert
    : serverIdentity.privateKey;
  const signature = await signText(transcript, signingKey);

  steps.push({
    id: "certificate-verify",
    record: "CertificateVerify",
    title: "Server signs everything said so far",
    side: "server",
    primitive: "sign",
    detail:
      "The server signs the whole transcript — both randoms and its ephemeral key — with its certificate's private key. Only the real key holder can produce this.",
    value: signature.slice(0, 28).replace(/(.{4})/g, "$1 ").trim() + " …",
  });

  // 5 — Client verifies the signature against the presented certificate.
  const valid = await verifyText(transcript, signature, serverIdentity.publicKey);

  if (!valid) {
    steps.push({
      id: "verify-fail",
      record: "CertificateVerify",
      title: "Signature doesn't match the certificate — abort",
      side: "client",
      primitive: "sign",
      failure: true,
      detail:
        "The signature wasn't produced by the certificate's private key, so whoever is on the other end doesn't actually own this certificate. The client tears the connection down before sharing any secret. No padlock.",
      value: "REJECTED",
    });
    return {
      ok: false,
      steps,
      serverIdentityFingerprint,
      sessionKeyFingerprint: null,
      request,
      ciphertext: null,
      decrypted: null,
    };
  }

  steps.push({
    id: "verify-ok",
    record: "CertificateVerify",
    title: "Client checks the signature — it holds",
    side: "client",
    primitive: "sign",
    detail:
      "Verified against the certificate's public key. The client now knows it's really talking to the certificate holder, and that nothing in the transcript was altered in flight.",
    value: "VALID ✓",
  });

  // 6 — Key agreement: both sides run ECDH and land on the same secret.
  const clientSecret = await deriveSharedSecret(
    clientEph.privateKey,
    serverEph.publicKey,
  );
  const serverSecret = await deriveSharedSecret(
    serverEph.privateKey,
    clientEph.publicKey,
  );
  const secretsAgree = bytesToHex(clientSecret) === bytesToHex(serverSecret);

  steps.push({
    id: "key-agreement",
    record: "Key Agreement",
    title: "Both sides derive the identical shared secret",
    side: "both",
    primitive: "exchange",
    detail: secretsAgree
      ? "Each side combines its own private key with the other's public key. ECDH guarantees they reach the same secret — which the eavesdropper, holding only the two public keys, cannot."
      : "Mismatch — this should never happen with honest keys.",
    value: fingerprint(clientSecret),
  });

  // 7 — Derive the AES-GCM session key from the raw secret via HKDF.
  const hkdfBase = await crypto.subtle.importKey(
    "raw",
    clientSecret as BufferSource,
    "HKDF",
    false,
    ["deriveKey"],
  );
  const saltBytes = new Uint8Array(clientRandom.raw.length + serverRandom.raw.length);
  saltBytes.set(clientRandom.raw, 0);
  saltBytes.set(serverRandom.raw, clientRandom.raw.length);
  const deriveSession = (km: CryptoKey) =>
    crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: saltBytes as BufferSource,
        info: textToBytes("saltworks tls 1.3 demo"),
      },
      km,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  const clientSession = await deriveSession(hkdfBase);
  // Server independently stretches its copy of the same secret.
  const serverHkdfBase = await crypto.subtle.importKey(
    "raw",
    serverSecret as BufferSource,
    "HKDF",
    false,
    ["deriveKey"],
  );
  const serverSession = await deriveSession(serverHkdfBase);

  const sessionRaw = await crypto.subtle.exportKey("raw", clientSession);
  const sessionDigest = await crypto.subtle.digest("SHA-256", sessionRaw);
  const sessionKeyFingerprint = fingerprint(new Uint8Array(sessionDigest));

  steps.push({
    id: "derive-keys",
    record: "Key Schedule",
    title: "Stretch the secret into a real session key",
    side: "both",
    primitive: "hash",
    detail:
      "The raw ECDH secret isn't used directly. HKDF — built on SHA-256 — runs it through a hash-based key schedule to produce the actual AES-GCM session key (and more).",
    value: sessionKeyFingerprint,
  });

  // 8 — Application data: encrypt the first real request under the session key.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    clientSession,
    textToBytes(request),
  );
  const ciphertext = bytesToBase64(new Uint8Array(cipherBuf));

  // The server decrypts with its independently-derived session key.
  let decrypted: string | null = null;
  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      serverSession,
      cipherBuf,
    );
    decrypted = bytesToText(new Uint8Array(plainBuf));
  } catch {
    decrypted = null;
  }

  steps.push({
    id: "application-data",
    record: "Application Data",
    title: "The channel is open — traffic is now sealed",
    side: "wire",
    primitive: "encrypt",
    detail:
      "From here every byte is AES-GCM encrypted under the session key. The client's first request travels as ciphertext, and the server — holding the same key — reads it.",
    value: trunc(ciphertext, 28),
  });

  return {
    ok: true,
    steps,
    serverIdentityFingerprint,
    sessionKeyFingerprint,
    request,
    ciphertext,
    decrypted,
  };
}
