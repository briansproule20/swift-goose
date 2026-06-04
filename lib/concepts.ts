import { Binary, Fingerprint, KeyRound, type LucideIcon } from "lucide-react";

export type ConceptId = "encode" | "hash" | "encrypt";

export interface Concept {
  id: ConceptId;
  name: string;
  algorithm: string;
  oneLine: string;
  reversible: string;
  needsKey: string;
  job: string;
  href: string;
  icon: LucideIcon;
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
};

export const CONCEPT_ORDER: ConceptId[] = ["encode", "hash", "encrypt"];
