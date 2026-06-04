"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { decodeBase64 } from "@/lib/encode";

export function Base64Decoder() {
  const [input, setInput] = useState("V2UgUmlkZSBmb3IgR29uZG9y");
  const trimmed = input.trim();
  const result = trimmed ? decodeBase64(trimmed) : null;

  return (
    <div className="rounded-xl border border-encode/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <label className="label-spec">paste base64</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a Base64 string…"
          className="min-h-20 resize-none font-data text-[13px] break-all"
          spellCheck={false}
        />
      </div>

      <div className="my-4 flex items-center gap-2 text-encode">
        <ArrowDown className="size-4" />
        <span className="font-data text-[11px]">decode (atob)</span>
      </div>

      <div className="rounded-lg border border-border bg-background/50 p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-spec">decoded text</span>
          {result?.ok && result.text && <CopyButton value={result.text} />}
        </div>
        {result === null ? (
          <p className="font-data text-[13px] text-muted-foreground/50">—</p>
        ) : result.ok ? (
          <p className="font-data text-[13px] break-all text-encode">
            {result.text || "(empty)"}
          </p>
        ) : (
          <p className="font-data text-[13px] text-destructive">
            {result.error}
          </p>
        )}
      </div>

      <p className="mt-4 font-data text-[11px] leading-relaxed text-muted-foreground">
        No key, no password, no permission — anyone with the string gets the
        text back. That&apos;s the point, and the reason it isn&apos;t security.
      </p>
    </div>
  );
}
