"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — silently ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-hash" />
      ) : (
        <Copy className="size-3.5" />
      )}
      <span className="tabular-nums">{copied ? "Copied" : label}</span>
    </button>
  );
}
