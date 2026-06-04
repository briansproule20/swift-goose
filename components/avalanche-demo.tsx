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

type ViewMode = "hex" | "bits";

/** A digest rendered char-by-char (hex digits or bits), diff tinted vs `compareTo`. */
function DigestRow({
  value,
  compareTo,
  mode,
}: {
  value: string;
  compareTo: string;
  mode: ViewMode;
}) {
  if (!value) {
    return <p className="font-data text-[13px] text-muted-foreground/50">…</p>;
  }
  return (
    <p
      className={cn(
        "font-data leading-relaxed break-all",
        mode === "hex" ? "text-[13px]" : "text-[11px] tracking-tight",
      )}
    >
      {value.split("").map((ch, i) => {
        const changed = ch !== compareTo[i];
        return (
          <span
            key={i}
            className={cn(
              changed
                ? "rounded-[2px] bg-hash-soft text-hash"
                : mode === "bits"
                  ? "text-muted-foreground/35"
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
  const [bitA, setBitA] = useState("");
  const [bitB, setBitB] = useState("");
  const [bitsChanged, setBitsChanged] = useState(0);
  const [mode, setMode] = useState<ViewMode>("hex");

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
      setBitA(bA);
      setBitB(bB);
      setBitsChanged(hammingDistance(bA, bB));
    })();
    return () => {
      alive = false;
    };
  }, [a, b]);

  const pct = ((bitsChanged / 256) * 100).toFixed(1);
  const valA = mode === "hex" ? hexA : bitA;
  const valB = mode === "hex" ? hexB : bitB;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="label-spec">sha-256 digest</span>
        <div className="flex rounded-md border border-border p-0.5">
          {(["hex", "bits"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2.5 py-0.5 font-data text-[11px] transition-colors",
                mode === m
                  ? "bg-hash-soft text-hash"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Side mark="bg-muted-foreground" text={a} value={valA} compareTo={valB} mode={mode} />
        <Side mark="bg-hash" text={b} value={valB} compareTo={valA} mode={mode} />
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
          {mode === "hex" && (
            <>
              {" "}
              The hex view lights whole 4-bit digits, so more <em>look</em>{" "}
              changed than bits actually flipped — switch to{" "}
              <button
                type="button"
                onClick={() => setMode("bits")}
                className="text-hash underline-offset-2 hover:underline"
              >
                bits
              </button>{" "}
              to count the real ones.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Side({
  mark,
  text,
  value,
  compareTo,
  mode,
}: {
  mark: string;
  text: string;
  value: string;
  compareTo: string;
  mode: ViewMode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", mark)} />
        <span className="font-data text-[11px] text-foreground/80">
          “{text || "∅"}”
        </span>
      </div>
      <DigestRow value={value} compareTo={compareTo} mode={mode} />
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
