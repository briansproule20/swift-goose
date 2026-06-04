import {
  ArrowLeftRight,
  Binary,
  Fingerprint,
  Handshake,
  KeyRound,
  PenLine,
  type LucideIcon,
} from "lucide-react";

export type ConceptId =
  | "encode"
  | "hash"
  | "encrypt"
  | "sign"
  | "exchange"
  | "handshake";

/**
 * Two tiers. The *primitives* are the indivisible building blocks — what each
 * one does on its own. The *protocols* are what you get when you compose those
 * blocks into something that solves a real-world problem (proving identity,
 * agreeing on a secret, opening a secure channel).
 */
export type Tier = "primitive" | "protocol";

export interface Concept {
  id: ConceptId;
  tier: Tier;
  name: string;
  algorithm: string;
  oneLine: string;
  reversible: string;
  needsKey: string;
  job: string;
  href: string;
  icon: LucideIcon;
  /** For protocols: the primitives they're built from. */
  builtFrom?: ConceptId[];
  /** Full Tailwind class strings (literal so the JIT can see them). */
  accent: {
    text: string;
    glow: string;
    border: string;
    bgSoft: string;
    ring: string;
    /** inline color for icon fills / SVG strokes */
    color: string;
  };
}

export const CONCEPTS: Record<ConceptId, Concept> = {
  encode: {
    id: "encode",
    tier: "primitive",
    name: "Encoding",
    algorithm: "Base64",
    oneLine: "Translation into a safe alphabet — not a secret.",
    reversible: "Yes — by anyone",
    needsKey: "No",
    job: "Safe transport of data",
    href: "/learn/encoding",
    icon: Binary,
    accent: {
      text: "text-encode",
      glow: "text-glow-encode",
      border: "border-encode/40",
      bgSoft: "bg-encode-soft",
      ring: "ring-encode/30",
      color: "var(--encode)",
    },
  },
  hash: {
    id: "hash",
    tier: "primitive",
    name: "Hashing",
    algorithm: "SHA-256",
    oneLine: "A one-way fingerprint — fixed size, no way back.",
    reversible: "No — one-way",
    needsKey: "No",
    job: "Verifying integrity & identity",
    href: "/learn/hashing",
    icon: Fingerprint,
    accent: {
      text: "text-hash",
      glow: "text-glow-hash",
      border: "border-hash/40",
      bgSoft: "bg-hash-soft",
      ring: "ring-hash/30",
      color: "var(--hash)",
    },
  },
  encrypt: {
    id: "encrypt",
    tier: "primitive",
    name: "Encryption",
    algorithm: "AES-GCM",
    oneLine: "Two-way scrambling that needs the right key to undo.",
    reversible: "Yes — with the key",
    needsKey: "Yes",
    job: "Secrecy with recovery",
    href: "/learn/encryption",
    icon: KeyRound,
    accent: {
      text: "text-encrypt",
      glow: "text-glow-encrypt",
      border: "border-encrypt/40",
      bgSoft: "bg-encrypt-soft",
      ring: "ring-encrypt/30",
      color: "var(--encrypt)",
    },
  },
  sign: {
    id: "sign",
    tier: "protocol",
    name: "Digital Signatures",
    algorithm: "ECDSA",
    oneLine: "Prove who wrote it — and that no one changed it.",
    reversible: "No — it's a proof, not a lock",
    needsKey: "Yes — a private/public pair",
    job: "Authenticity & non-repudiation",
    href: "/learn/signatures",
    icon: PenLine,
    builtFrom: ["hash"],
    accent: {
      text: "text-sign",
      glow: "text-glow-sign",
      border: "border-sign/40",
      bgSoft: "bg-sign-soft",
      ring: "ring-sign/30",
      color: "var(--sign)",
    },
  },
  exchange: {
    id: "exchange",
    tier: "protocol",
    name: "Key Exchange",
    algorithm: "ECDH",
    oneLine: "Agree on a secret over a line everyone can hear.",
    reversible: "—",
    needsKey: "Yes — a pair each side",
    job: "A shared secret from thin air",
    href: "/learn/key-exchange",
    icon: ArrowLeftRight,
    builtFrom: ["hash"],
    accent: {
      text: "text-exchange",
      glow: "text-glow-exchange",
      border: "border-exchange/40",
      bgSoft: "bg-exchange-soft",
      ring: "ring-exchange/30",
      color: "var(--exchange)",
    },
  },
  handshake: {
    id: "handshake",
    tier: "protocol",
    name: "TLS Handshake",
    algorithm: "TLS 1.3",
    oneLine: "Where every piece meets to open a secure line.",
    reversible: "—",
    needsKey: "Yes — all of the above",
    job: "Bootstrapping a private channel",
    href: "/learn/tls-handshake",
    icon: Handshake,
    builtFrom: ["sign", "exchange", "encrypt"],
    accent: {
      text: "text-handshake",
      glow: "text-glow-handshake",
      border: "border-handshake/40",
      bgSoft: "bg-handshake-soft",
      ring: "ring-handshake/30",
      color: "var(--handshake)",
    },
  },
};

/** The primitives — the original three, used by the hero + comparison table. */
export const CONCEPT_ORDER: ConceptId[] = ["encode", "hash", "encrypt"];

/** The protocols — what the primitives build into. The handshake is the capstone. */
export const PROTOCOL_ORDER: ConceptId[] = ["sign", "exchange", "handshake"];

/** The order a learner should move through within a single tier. */
export function tierOrder(tier: Tier): ConceptId[] {
  return tier === "primitive" ? CONCEPT_ORDER : PROTOCOL_ORDER;
}
