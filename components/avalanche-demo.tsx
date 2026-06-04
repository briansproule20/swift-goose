"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { sha256Bits, sha256Hex } from "@/lib/hash";
import { hammingDistance } from "@/lib/bytes";
import { cn } from "@/lib/utils";

/** Change the final character to its neighbor so a one-character flip always differs. */
function flipLastChar(text: string): string {
  if (text.length === 0) return "a";
  const last = text[text.length - 1];
  return text.slice(0, -1) + String.fromCharCode(last.charCodeAt(0) + 1);
}

/** A hex digest with every nibble that differs from `compareTo` tinted. */
function HashRow({ hex, compareTo }: { hex: string; compareTo: string }) {
  if (!hex) {
    return <p className="font-data text-[13px] text-muted-foreground/50">…</p>;
  }
  return (
    <p className="font-data text-[13px] leading-relaxed break-all">
      {hex.split("").map((ch, i) => {
        const changed = ch !== compareTo[i];
        return (
          <span
            key={i}
            className={cn(
              changed
                ? "rounded-[2px] bg-hash-soft text-hash"
                : "text-muted-foreground/60",
            )}
          >
            {ch}
          </span>
        );
      })}
    </p>
  );
}

/** Hashes two strings, shows both digests with the diff tinted, plus a meter. */
function HashCompare({ a, b }: { a: string; b: string }) {
  const [hexA, setHexA] = useState("");
  const [hexB, setHexB] = useState("");
  const [bitsChanged, setBitsChanged] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [hA, hB, bA, bB] = await Promise.all([
        sha256Hex(a),
        sha256Hex(b),
        sha256Bits(a),
        sha256Bits(b),
      ]);
      if (!alive) return;
      setHexA(hA);
      setHexB(hB);
      setBitsChanged(hammingDistance(bA, bB));
    })();
    return () => {
      alive = false;
    };
  }, [a, b]);

  const pct = ((bitsChanged / 256) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Side mark="bg-muted-foreground" text={a} hex={hexA} compareTo={hexB} />
        <Side mark="bg-hash" text={b} hex={hexB} compareTo={hexA} />
      </div>

      <div className="rounded-lg border border-border bg-background/50 p-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">
            Output bits changed
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
          {bitsChanged} of 256 bits flipped — about half, with no pattern.
        </p>
      </div>
    </div>
  );
}

function Side({
  mark,
  text,
  hex,
  compareTo,
}: {
  mark: string;
  text: string;
  hex: string;
  compareTo: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", mark)} />
        <span className="font-data text-[11px] text-foreground/80">
          “{text || "∅"}”
        </span>
      </div>
      <HashRow hex={hex} compareTo={compareTo} />
    </div>
  );
}

export function AvalancheDemo() {
  const [text, setText] = useState("The quick brown fox");
  const variant = useMemo(() => flipLastChar(text), [text]);

  return (
    <div className="space-y-4">
      {/* fixed, read-only worked example */}
      <div className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
        <p className="label-spec mb-4">worked example · one letter changed</p>
        <HashCompare a="cat" b="cot" />
      </div>

      {/* live, editable */}
      <div className="rounded-xl border border-hash/30 bg-card/50 p-5 sm:p-6">
        <p className="label-spec mb-3">now you — edit a single character</p>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-data"
          placeholder="Type anything…"
        />
        <p className="mt-2 font-data text-[11px] text-muted-foreground">
          compared against the same text with its last character bumped by one
        </p>
        <div className="mt-5">
          <HashCompare a={text} b={variant} />
        </div>
      </div>
    </div>
  );
}
