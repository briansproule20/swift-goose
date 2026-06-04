"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { base64Overhead, decodeBase64, encodeBase64 } from "@/lib/encode";

export function EncodeDemo() {
  const [text, setText] = useState("naïve café");
  const encoded = text ? encodeBase64(text) : "";
  const roundTrip = encoded ? decodeBase64(encoded) : null;
  const overhead = base64Overhead(text);
  const padding = (encoded.match(/=+$/)?.[0].length ?? 0) as number;

  return (
    <div className="rounded-xl border border-encode/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          plain text
        </label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-data"
          placeholder="Type anything — accents count as 2+ bytes…"
        />
      </div>

      <div className="my-4 flex items-center gap-2 text-encode">
        <ArrowDown className="size-4" />
        <span className="font-data text-[11px]">encode (btoa)</span>
      </div>

      <div className="rounded-lg border border-border bg-background/50 p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
            base64
          </span>
          {encoded && <CopyButton value={encoded} />}
        </div>
        <p className="font-data text-[13px] leading-relaxed break-all text-encode">
          {encoded || "—"}
        </p>
      </div>

      <div className="my-4 flex items-center gap-2 text-muted-foreground">
        <ArrowUp className="size-4" />
        <span className="font-data text-[11px]">
          decode (atob) — anyone can, instantly
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background/50 p-3.5">
        <span className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          back to plain text
        </span>
        <p className="mt-2 font-data text-[13px] break-all text-foreground/90">
          {roundTrip?.ok ? roundTrip.text : "—"}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 font-data text-xs">
        <Stat label="input bytes" value={overhead.inputBytes} />
        <Stat label="base64 chars" value={overhead.outputChars} />
        <Stat
          label="= padding"
          value={padding === 0 ? "none" : "=".repeat(padding)}
        />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-base text-encode">{value}</dd>
    </div>
  );
}
