"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDown, Fingerprint, KeyRound, PenLine } from "lucide-react";
import { sha256Hex } from "@/lib/hash";
import { cn } from "@/lib/utils";

const EXAMPLE = "I authorize the transfer of 100 credits.";

/**
 * The shape of signing, as a diagram: you never sign the whole message — you
 * sign its hash. Small, fixed-size, and tamper-evident. The public key reverses
 * only the *check*, never the signing.
 */
export function SignatureFlow() {
  const [digest, setDigest] = useState("");

  useEffect(() => {
    let alive = true;
    sha256Hex(EXAMPLE).then((d) => alive && setDigest(d));
    return () => {
      alive = false;
    };
  }, []);

  const shortDigest = digest
    ? digest.slice(0, 24).replace(/(.{4})/g, "$1 ").trim() + " …"
    : "…";

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="flex flex-col items-stretch gap-0">
        <Node
          step="01"
          icon={<PenLine className="size-4" />}
          label="the message"
          value={`“${EXAMPLE}”`}
          tone="muted"
        />
        <Connector label="SHA-256 — take its fingerprint" />
        <Node
          step="02"
          icon={<Fingerprint className="size-4" />}
          label="the digest · 256 bits, fixed size"
          value={shortDigest}
          tone="hash"
        />
        <Connector label="ECDSA · seal it with the private key" accent />
        <Node
          step="03"
          icon={<KeyRound className="size-4" />}
          label="the signature"
          value="3045 0221 00b8 4e… — only the private key could make this"
          tone="sign"
        />
      </div>

      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        To <strong className="text-foreground/90">verify</strong>, anyone
        re-hashes the message and asks the matching{" "}
        <em>public</em> key whether that digest and signature line up. The
        public key can <em>check</em> a signature but never{" "}
        <em>create</em>{" "}one — which is exactly why it&apos;s safe to publish.
      </p>
    </div>
  );
}

function Node({
  step,
  icon,
  label,
  value,
  tone,
}: {
  step: string;
  icon: ReactNode;
  label: string;
  value: string;
  tone: "muted" | "hash" | "sign";
}) {
  const toneText =
    tone === "sign" ? "text-sign" : tone === "hash" ? "text-hash" : "text-muted-foreground";
  const toneBorder =
    tone === "sign"
      ? "border-sign/40"
      : tone === "hash"
        ? "border-hash/40"
        : "border-border";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className={cn("rounded-lg border bg-background/50 p-3.5", toneBorder)}
    >
      <div className="flex items-center gap-2">
        <span className="label-spec">{step}</span>
        <span className={cn("flex items-center gap-1.5", toneText)}>
          {icon}
          <span className="font-data text-[11px]">{label}</span>
        </span>
      </div>
      <p className="mt-2 font-data text-[12px] break-all text-foreground/85">
        {value}
      </p>
    </motion.div>
  );
}

function Connector({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-2 pl-1.5">
      <ArrowDown
        className={cn("size-4", accent ? "text-sign" : "text-muted-foreground/60")}
      />
      <span
        className={cn(
          "font-data text-[11px]",
          accent ? "text-sign/90" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
