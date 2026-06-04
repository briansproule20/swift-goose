"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, Minus, Plus, Sparkles } from "lucide-react";
import { discreteLogBruteForce, toyExchange } from "@/lib/exchange";

// Deliberately tiny so the arithmetic fits in your head. Real Diffie–Hellman
// uses a prime hundreds of digits long; the *shape* is identical.
const G = BigInt(5);
const P = BigInt(23);

export function DiffieHellmanMath() {
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);
  const [cracked, setCracked] = useState<{ exponent: bigint; tries: number } | null>(
    null,
  );

  const ex = useMemo(
    () => toyExchange(G, P, BigInt(a), BigInt(b)),
    [a, b],
  );

  const crack = () => {
    setCracked(discreteLogBruteForce(G, P, ex.alicePublic));
  };

  const clamp = (n: number) => Math.max(1, Math.min(Number(P) - 1, n));

  return (
    <div className="space-y-3">
      {/* public parameters */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/40 px-3.5 py-2.5">
        <span className="label-spec">public, known to all</span>
        <span className="font-data text-[12px] text-foreground/85">
          base g = <span className="text-exchange">{G.toString()}</span>
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-data text-[12px] text-foreground/85">
          prime p = <span className="text-exchange">{P.toString()}</span>
        </span>
      </div>

      {/* the two participants */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Participant
          name="Alice"
          secretLabel="a"
          secret={a}
          onSet={(n) => {
            setA(clamp(n));
            setCracked(null);
          }}
          publicLabel="A = gᵃ mod p"
          publicValue={ex.alicePublic}
        />
        <Participant
          name="Bob"
          secretLabel="b"
          secret={b}
          onSet={(n) => {
            setB(clamp(n));
            setCracked(null);
          }}
          publicLabel="B = gᵇ mod p"
          publicValue={ex.bobPublic}
        />
      </div>

      {/* they swap publics and each computes the same secret */}
      <div className="rounded-lg border border-exchange/40 bg-exchange-soft p-4">
        <div className="flex items-center gap-2 text-exchange">
          <Sparkles className="size-4" />
          <span className="font-data text-[11px]">
            each raises the other&apos;s public value to their own secret
          </span>
        </div>
        <div className="mt-3 grid gap-2 font-data text-[12px] sm:grid-cols-2">
          <p className="text-foreground/85">
            Alice: Bᵃ mod p ={" "}
            <span className="text-exchange">{ex.aliceShared.toString()}</span>
          </p>
          <p className="text-foreground/85">
            Bob: Aᵇ mod p ={" "}
            <span className="text-exchange">{ex.bobShared.toString()}</span>
          </p>
        </div>
        <motion.p
          key={ex.aliceShared.toString()}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="mt-3 border-t border-exchange/20 pt-3 font-display text-lg text-exchange"
        >
          shared secret = {ex.aliceShared.toString()}
          <span className="ml-2 font-data text-[11px] text-muted-foreground">
            — same on both sides, never sent
          </span>
        </motion.p>
      </div>

      {/* the eavesdropper */}
      <div className="rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Eye className="size-4" />
            <span className="font-data text-[11px]">
              Eve sees g, p, A = {ex.alicePublic.toString()}, B ={" "}
              {ex.bobPublic.toString()}
            </span>
          </span>
          <button
            type="button"
            onClick={crack}
            className="shrink-0 rounded-md border border-border px-2.5 py-1 font-data text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            try to crack it
          </button>
        </div>
        {cracked && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 font-data text-[12px] text-foreground/85"
          >
            Brute force recovered a = {cracked.exponent.toString()} in{" "}
            <span className="text-destructive">{cracked.tries}</span> tries.
            Trivial here — but with a real 2048-bit prime that count is around{" "}
            <span className="text-exchange">2³⁰⁰⁰</span>, more steps than there
            are atoms in the universe.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Participant({
  name,
  secretLabel,
  secret,
  onSet,
  publicLabel,
  publicValue,
}: {
  name: string;
  secretLabel: string;
  secret: number;
  onSet: (n: number) => void;
  publicLabel: string;
  publicValue: bigint;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <span className="font-display text-lg">{name}</span>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-data text-[12px] text-muted-foreground">
          private {secretLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <Stepper dir="down" onClick={() => onSet(secret - 1)} />
          <span className="w-7 text-center font-data text-base text-foreground">
            {secret}
          </span>
          <Stepper dir="up" onClick={() => onSet(secret + 1)} />
        </div>
      </div>
      <div className="mt-3 rounded-md border border-exchange/30 bg-exchange-soft px-3 py-2">
        <span className="label-spec">{publicLabel} · sent in the open</span>
        <p className="mt-0.5 font-data text-base text-exchange">
          {publicValue.toString()}
        </p>
      </div>
    </div>
  );
}

function Stepper({ dir, onClick }: { dir: "up" | "down"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "up" ? "increase" : "decrease"}
      className="grid size-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-exchange/50 hover:text-exchange"
    >
      {dir === "up" ? <Plus className="size-3" /> : <Minus className="size-3" />}
    </button>
  );
}
