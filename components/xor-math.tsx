"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function bits(n: number) {
  return (n & 0xff).toString(2).padStart(8, "0").split("");
}

function printable(code: number) {
  return code >= 32 && code <= 126 ? String.fromCharCode(code) : "·";
}

/**
 * XOR is the reversible heart of symmetric encryption: c = p ⊕ k, and
 * p = c ⊕ k. Apply the same key twice and you're back where you started —
 * which is exactly why the *right* key recovers the message and a wrong one
 * doesn't. AES is vastly more than this, but this is the move it's built on.
 */
export function XorMath() {
  const [char, setChar] = useState("A");
  const [key, setKey] = useState(90);

  const p = char.charCodeAt(0) || 0;
  const k = key & 0xff;
  const c = p ^ k;
  const back = c ^ k; // === p
  const wrong = c ^ ((k + 1) & 0xff); // wrong key by 1

  return (
    <div className="rounded-xl border border-encrypt/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <label className="label-spec">plaintext char</label>
          <Input
            value={char}
            maxLength={1}
            onChange={(e) => setChar(e.target.value.slice(-1) || "A")}
            className="w-20 font-data text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="label-spec">key byte (0–255)</label>
          <Input
            type="number"
            min={0}
            max={255}
            value={key}
            onChange={(e) =>
              setKey(Math.max(0, Math.min(255, Number(e.target.value) || 0)))
            }
            className="w-28 font-data text-base"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-fit space-y-1.5">
          <BitLine label="plaintext" hint={`${printable(p)} · ${p}`} bits={bits(p)} />
          <BitLine label="key" hint={`${k}`} bits={bits(k)} op="⊕" muted />
          <div className="h-px bg-border" />
          <BitLine
            label="ciphertext"
            hint={`${printable(c)} · ${c}`}
            bits={bits(c)}
            accent
          />
        </div>
      </div>

      <p className="label-spec mt-6">apply the key again</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-encode/30 bg-encode-soft p-3">
          <div className="font-data text-[11px] text-muted-foreground">
            ciphertext ⊕ right key ({k})
          </div>
          <div className="mt-1 font-data text-sm text-encode">
            → {printable(back)} · {back}{" "}
            <span className="text-muted-foreground">
              (back to “{printable(p)}”)
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="font-data text-[11px] text-muted-foreground">
            ciphertext ⊕ wrong key ({(k + 1) & 0xff})
          </div>
          <div className="mt-1 font-data text-sm text-destructive">
            → {printable(wrong)} · {wrong}{" "}
            <span className="text-muted-foreground/80">(garbage)</span>
          </div>
        </div>
      </div>

      <p className="mt-5 font-data text-[12px] leading-relaxed text-muted-foreground">
        One bit off in the key and the output is wrong — and there&apos;s no hint
        how wrong. Real AES-GCM goes further: it won&apos;t even hand you the
        garbage, it checks an authentication tag and refuses outright.
      </p>
    </div>
  );
}

function BitLine({
  label,
  hint,
  bits,
  op,
  accent,
  muted,
}: {
  label: string;
  hint: string;
  bits: string[];
  op?: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-right font-data text-[11px] text-muted-foreground">
        {op && <span className="mr-1 text-encrypt">{op}</span>}
        {label}
      </span>
      <div className="flex gap-px">
        {bits.map((b, i) => (
          <span
            key={i}
            className={cn(
              "grid size-5 place-items-center rounded-[3px] font-data text-[11px]",
              b === "1"
                ? accent
                  ? "bg-encrypt-soft text-encrypt"
                  : muted
                    ? "bg-secondary text-muted-foreground"
                    : "bg-secondary text-foreground"
                : "text-muted-foreground/40",
            )}
          >
            {b}
          </span>
        ))}
      </div>
      <span className="font-data text-[11px] text-muted-foreground">{hint}</span>
    </div>
  );
}
