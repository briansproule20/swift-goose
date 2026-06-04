"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeftRight, Check, Eye, RefreshCw } from "lucide-react";
import {
  deriveSharedSecret,
  exportPublicBytes,
  fingerprint,
  generateExchangeKeyPair,
} from "@/lib/exchange";
import { cn } from "@/lib/utils";

interface State {
  alicePub: string;
  bobPub: string;
  aliceSecret: string;
  bobSecret: string;
  agree: boolean;
}

/** Run a real ECDH exchange between two fresh key pairs. */
async function computeExchange(): Promise<State> {
  const [alice, bob] = await Promise.all([
    generateExchangeKeyPair(),
    generateExchangeKeyPair(),
  ]);
  const [alicePub, bobPub] = await Promise.all([
    exportPublicBytes(alice.publicKey),
    exportPublicBytes(bob.publicKey),
  ]);
  const [aliceShared, bobShared] = await Promise.all([
    deriveSharedSecret(alice.privateKey, bob.publicKey),
    deriveSharedSecret(bob.privateKey, alice.publicKey),
  ]);
  const aliceSecret = fingerprint(aliceShared, 32);
  const bobSecret = fingerprint(bobShared, 32);
  return {
    alicePub: fingerprint(alicePub, 20),
    bobPub: fingerprint(bobPub, 20),
    aliceSecret,
    bobSecret,
    agree: aliceSecret === bobSecret,
  };
}

export function ExchangeDemo() {
  const [state, setState] = useState<State | null>(null);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await computeExchange();
      if (alive) setState(s);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rerun = async () => {
    setSpin(true);
    setState(await computeExchange());
    setSpin(false);
  };

  return (
    <div className="rounded-xl border border-exchange/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-exchange">
          <ArrowLeftRight className="size-4" />
          <span className="font-data text-[11px]">
            ECDH P-256 — your browser&apos;s real key exchange
          </span>
        </div>
        <button
          type="button"
          onClick={rerun}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-data text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn("size-3", spin && "animate-spin")} />
          new keys
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Party name="Alice" pub={state?.alicePub} />
        <Party name="Bob" pub={state?.bobPub} />
      </div>

      {/* derived secrets */}
      <div
        className={cn(
          "mt-3 rounded-lg border p-4",
          state?.agree
            ? "border-exchange/40 bg-exchange-soft"
            : "border-destructive/40 bg-destructive/5",
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Secret label="Alice derives" value={state?.aliceSecret} />
          <Secret label="Bob derives" value={state?.bobSecret} />
        </div>
        {state?.agree && (
          <motion.p
            key={state.aliceSecret}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 border-t border-exchange/20 pt-3 font-display text-base text-exchange"
          >
            <Check className="size-4" />
            Identical — and neither secret was ever transmitted.
          </motion.p>
        )}
      </div>

      {/* eavesdropper */}
      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-background/40 p-3.5">
        <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="font-data text-[11px] leading-relaxed text-muted-foreground">
          An eavesdropper captured both public keys above — and that&apos;s all
          they get. Recovering the shared secret from the two publics is the
          elliptic-curve discrete log problem: easy to compute forward,
          infeasible to reverse.
        </p>
      </div>
    </div>
  );
}

function Party({ name, pub }: { name: string; pub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <span className="font-display text-lg">{name}</span>
      <div className="mt-2">
        <span className="label-spec">public key · sent in the open</span>
        <p className="mt-1 font-data text-[12px] break-all text-foreground/70">
          {pub ? pub + " …" : "…"}
        </p>
      </div>
    </div>
  );
}

function Secret({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="label-spec">{label} · shared secret</span>
      <p className="mt-1 font-data text-[12px] break-all text-exchange">
        {value ? value + " …" : "…"}
      </p>
    </div>
  );
}
