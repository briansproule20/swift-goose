"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { sha256Bits, sha256Hex } from "@/lib/hash";
import { hammingDistance } from "@/lib/bytes";
import { cn } from "@/lib/utils";

/** Change the final character to its neighbor so a "one-character flip" always differs. */
function flipLastChar(text: string): string {
  if (text.length === 0) return "a";
  const last = text[text.length - 1];
  const flipped = String.fromCharCode(last.charCodeAt(0) + 1);
  return text.slice(0, -1) + flipped;
}

/** Render a hex digest, tinting every nibble that differs from `compareTo`. */
function HashRow({ hex, compareTo }: { hex: string; compareTo: string }) {
  return (
    <p className="font-data text-[13px] leading-relaxed break-all">
      {hex.split("").map((ch, i) => {
        const changed = ch !== compareTo[i];
        return (
          <span
            key={i}
            className={cn(
              "transition-colors",
              changed
                ? "rounded-[2px] bg-hash-soft text-hash"
                : "text-muted-foreground/70",
            )}
          >
            {ch}
          </span>
        );
      })}
    </p>
  );
}

export function AvalancheDemo() {
  const [text, setText] = useState("The quick brown fox");
  const variant = useMemo(() => flipLastChar(text), [text]);

  const [hashA, setHashA] = useState("");
  const [hashB, setHashB] = useState("");
  const [bitsChanged, setBitsChanged] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [hexA, hexB, bitsAStr, bitsBStr] = await Promise.all([
        sha256Hex(text),
        sha256Hex(variant),
        sha256Bits(text),
        sha256Bits(variant),
      ]);
      if (!alive) return;
      setHashA(hexA);
      setHashB(hexB);
      setBitsChanged(hammingDistance(bitsAStr, bitsBStr));
    })();
    return () => {
      alive = false;
    };
  }, [text, variant]);

  const pct = ((bitsChanged / 256) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-hash/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          your input
        </label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-data"
          placeholder="Type anything…"
        />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            <span className="font-data text-[11px] text-muted-foreground">
              hash of <span className="text-foreground/80">“{text || "∅"}”</span>
            </span>
          </div>
          <HashRow hex={hashA} compareTo={hashB} />
        </div>

        <div className="flex items-center gap-2 pl-0.5">
          <span className="font-data text-[11px] text-hash">
            ↓ change one character ↓
          </span>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-hash" />
            <span className="font-data text-[11px] text-muted-foreground">
              hash of <span className="text-foreground/80">“{variant}”</span>
            </span>
          </div>
          <HashRow hex={hashB} compareTo={hashA} />
        </div>
      </div>

      {/* stat meter */}
      <div className="mt-6 rounded-lg border border-border bg-background/50 p-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">
            Bits changed by a single-character edit
          </span>
          <span className="font-data text-2xl text-hash">
            {pct}
            <span className="text-sm text-muted-foreground">%</span>
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-hash"
            initial={false}
            animate={{ width: `${(bitsChanged / 256) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="mt-2 font-data text-[11px] text-muted-foreground">
          {bitsChanged} of 256 output bits flipped — and you can&apos;t predict
          which. That&apos;s the avalanche effect.
        </p>
      </div>
    </div>
  );
}
