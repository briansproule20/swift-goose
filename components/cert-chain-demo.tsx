"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUp,
  BadgeCheck,
  Check,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { buildScenario, type CertView, type Flaw, type Scenario } from "@/lib/pki";
import { cn } from "@/lib/utils";

const FLAWS: { id: Flaw; label: string }[] = [
  { id: "none", label: "valid" },
  { id: "leaf-key", label: "swapped key" },
  { id: "intermediate-sig", label: "broken signature" },
  { id: "untrusted-root", label: "untrusted root" },
];

const ROLE_LABEL: Record<CertView["role"], string> = {
  leaf: "end-entity · the website",
  intermediate: "intermediate CA",
  root: "root CA · trust anchor",
};

export function CertChainDemo() {
  const [flaw, setFlaw] = useState<Flaw>("none");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await buildScenario("none");
      if (alive) setScenario(s);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const select = async (f: Flaw) => {
    setFlaw(f);
    setBusy(true);
    setScenario(await buildScenario(f));
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-certificates/30 bg-card/50 p-5 sm:p-6">
      {/* flaw controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="label-spec">inject a flaw</span>
        <button
          type="button"
          onClick={() => select(flaw)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-data text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn("size-3", busy && "animate-spin")} />
          rebuild
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {FLAWS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => select(f.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-data text-[11px] transition-colors",
              flaw === f.id
                ? f.id === "none"
                  ? "border-certificates/50 bg-certificates-soft text-certificates"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* the chain, leaf at top → root at bottom */}
      <div className="mt-5 space-y-0">
        {scenario?.certs.map((c, i) => (
          <div key={c.role}>
            <CertCard cert={c} />
            {i < scenario.certs.length - 1 && (
              <div className="flex items-center gap-2 py-1.5 pl-3">
                <ArrowUp className="size-3.5 text-muted-foreground/60" />
                <span className="font-data text-[10px] text-muted-foreground">
                  vouches for the certificate above
                </span>
              </div>
            )}
          </div>
        ))}
        {!scenario && (
          <div className="h-48 animate-pulse rounded-lg border border-certificates/20 bg-background/40" />
        )}
      </div>

      {/* verdict */}
      {scenario && (
        <div
          className={cn(
            "mt-4 flex items-start gap-3 rounded-lg border p-4",
            scenario.ok
              ? "border-certificates/40 bg-certificates-soft"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          {scenario.ok ? (
            <>
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-certificates" />
              <div>
                <p className="font-display text-lg leading-none text-certificates">
                  Chain trusted
                </p>
                <p className="mt-2 text-sm text-foreground/80">
                  Every signature checks against the issuer above it, and the
                  chain ends at a root your browser already trusts. This is the
                  padlock.
                </p>
              </div>
            </>
          ) : (
            <>
              <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-display text-lg leading-none text-destructive">
                  Chain rejected
                </p>
                <p className="mt-2 text-sm text-destructive/90">
                  {scenario.certs.find((c) => !c.ok)?.detail ??
                    "A link in the chain failed to verify."}{" "}
                  One broken link and the whole certificate is untrusted.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CertCard({ cert }: { cert: CertView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border bg-background/50 p-4",
        cert.ok ? "border-certificates/40" : "border-destructive/45",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 label-spec">
          <BadgeCheck
            className={cn(
              "size-3",
              cert.ok ? "text-certificates" : "text-destructive",
            )}
          />
          {ROLE_LABEL[cert.role]}
        </span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full",
            cert.ok
              ? "bg-certificates-soft text-certificates"
              : "bg-destructive/15 text-destructive",
          )}
        >
          {cert.ok ? <Check className="size-3" /> : <X className="size-3" />}
        </span>
      </div>

      <p className="mt-2 font-display text-lg leading-tight">{cert.subject}</p>
      <p className="font-data text-[11px] text-muted-foreground">
        issued by {cert.issuer}
      </p>

      <dl className="mt-2.5 space-y-1.5">
        <Field label="public key" value={cert.publicKeyHex} />
        <Field label="issuer signature" value={cert.signatureHex} />
      </dl>

      <p
        className={cn(
          "mt-2.5 font-data text-[11px]",
          cert.ok ? "text-certificates" : "text-destructive",
        )}
      >
        {cert.detail}
      </p>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="label-spec">{label}</dt>
      <dd className="font-data text-[11px] break-all text-foreground/70">
        {value}
      </dd>
    </div>
  );
}
