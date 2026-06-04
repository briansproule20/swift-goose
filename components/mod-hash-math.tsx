"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MOD = 12;

/**
 * A toy hash: h(n) = n mod 12, the "clock" hash. Real hashes also *mix* the
 * bits (that's the avalanche), but the irreversible part is exactly this —
 * a huge input space collapsed onto a tiny output space. Many inputs, one
 * output, no way back.
 */
export function ModHashMath() {
  const [n, setN] = useState(39);
  const out = ((n % MOD) + MOD) % MOD;

  // other inputs (0..200) that hash to the same slot — the collision set
  const collisions: number[] = [];
  for (let i = 0; i <= 200 && collisions.length < 8; i++) {
    if (((i % MOD) + MOD) % MOD === out) collisions.push(i);
  }

  return (
    <div className="rounded-xl border border-hash/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <label className="label-spec">input n</label>
          <Input
            type="number"
            value={n}
            onChange={(e) => setN(Number(e.target.value) || 0)}
            className="w-28 font-data text-base"
          />
        </div>
        <div className="pb-2 font-data text-sm text-muted-foreground">
          h(n) = n mod {MOD} ={" "}
          <span className="text-hash text-lg">{out}</span>
        </div>
      </div>

      {/* the 12 output slots */}
      <p className="label-spec mt-6">12 possible outputs</p>
      <div className="mt-3 grid grid-cols-12 gap-1.5">
        {Array.from({ length: MOD }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "grid aspect-square place-items-center rounded-md border font-data text-sm transition-colors",
              i === out
                ? "border-hash bg-hash-soft text-hash"
                : "border-border text-muted-foreground/50",
            )}
          >
            {i}
          </div>
        ))}
      </div>

      {/* collisions */}
      <p className="label-spec mt-6">inputs that all land on {out}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 font-data text-sm">
        {collisions.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-md border px-2 py-1",
                c === n
                  ? "border-hash bg-hash-soft text-hash"
                  : "border-border text-foreground/80",
              )}
            >
              {c}
            </span>
            {i < collisions.length - 1 && (
              <span className="text-muted-foreground/40">·</span>
            )}
          </span>
        ))}
        <span className="text-muted-foreground/60">· …forever</span>
      </div>

      <p className="mt-5 font-data text-[12px] leading-relaxed text-muted-foreground">
        Going forward is one cheap division. Going back is impossible: the
        output <span className="text-hash">{out}</span> came from one of
        infinitely many inputs, and nothing in it says which. SHA-256 is the
        same move at absurd scale — every input, of any length, crushed onto one
        of 2<sup>256</sup> outputs.
      </p>
    </div>
  );
}
