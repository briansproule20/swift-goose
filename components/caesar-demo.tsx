"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

function shiftText(text: string, n: number): string {
  return text.replace(/[a-z]/gi, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(
      ((ch.charCodeAt(0) - base + n) % 26 + 26) % 26 + base,
    );
  });
}

export function CaesarDemo() {
  const [text, setText] = useState("Veni Vidi Vici");
  const [n, setN] = useState(3);
  const out = shiftText(text, n);

  return (
    <div className="rounded-xl border border-encrypt/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <label className="label-spec">message</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-data"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="label-spec">shift</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setN((v) => (v + 25) % 26)}
              className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Decrease shift"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-data text-lg text-encrypt">
              {n}
            </span>
            <button
              type="button"
              onClick={() => setN((v) => (v + 1) % 26)}
              className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Increase shift"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-background/50 p-3.5">
        <span className="label-spec">shifted</span>
        <p className="mt-2 font-data text-[15px] break-all text-encrypt">
          {out || "—"}
        </p>
      </div>

      <p className="mt-4 font-data text-[11px] leading-relaxed text-muted-foreground">
        A shift of 3 is the cipher Julius Caesar actually used. The whole
        &ldquo;key&rdquo; is one number out of 25 — so you break it by trying all
        of them. This is encryption at its most primitive: reversible, but with
        almost nothing to hide behind.
      </p>
    </div>
  );
}
