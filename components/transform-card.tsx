"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CONCEPTS, type ConceptId } from "@/lib/concepts";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export function TransformCard({
  conceptId,
  output,
  state = "ok",
  note,
  children,
}: {
  conceptId: ConceptId;
  output: string;
  state?: "ok" | "error" | "empty";
  note?: ReactNode;
  /** Extra controls rendered above the output, e.g. the key field for AES. */
  children?: ReactNode;
}) {
  const c = CONCEPTS[conceptId];
  const Icon = c.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm">
      {/* top accent hairline */}
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${c.accent.color}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-lg border",
              c.accent.border,
              c.accent.bgSoft,
            )}
          >
            <Icon className={cn("size-4.5", c.accent.text)} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg leading-none">{c.name}</h3>
              <code
                className={cn(
                  "rounded px-1.5 py-0.5 font-data text-[10px] uppercase tracking-wider",
                  c.accent.bgSoft,
                  c.accent.text,
                )}
              >
                {c.algorithm}
              </code>
            </div>
            <p className="mt-1 max-w-[24ch] text-xs leading-snug text-muted-foreground">
              {c.oneLine}
            </p>
          </div>
        </div>
        <Link
          href={c.href}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Learn about ${c.name}`}
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {children && <div className="px-5 pb-3">{children}</div>}

      {/* output terminal */}
      <div className="mt-auto px-5 pb-5">
        <div
          className={cn(
            "relative min-h-[5.5rem] rounded-lg border bg-background/50 p-3.5",
            state === "error" ? "border-destructive/40" : "border-border",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
              {state === "error" ? "failed" : "output"}
            </span>
            {state === "ok" && output && (
              <CopyButton value={output} />
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={output || state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "font-data text-[13px] leading-relaxed break-all",
                state === "error" && "text-destructive",
                state === "empty" && "text-muted-foreground/60",
                state === "ok" && c.accent.text,
              )}
            >
              {output || "—"}
            </motion.p>
          </AnimatePresence>
        </div>

        {note && (
          <div className="mt-2.5 text-xs text-muted-foreground">{note}</div>
        )}
      </div>
    </div>
  );
}
