"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CONCEPT_ORDER, CONCEPTS } from "@/lib/concepts";
import { encodeBase64 } from "@/lib/encode";
import { sha256Hex } from "@/lib/hash";
import { encryptText } from "@/lib/encrypt";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Truncate long mono output so the three rows stay one-line and legible. */
function clip(s: string, n = 38) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function FeltIntro() {
  const [text, setText] = useState("attack at dawn");
  const [outputs, setOutputs] = useState<Record<string, string>>({
    encode: "",
    hash: "",
    encrypt: "",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const encode = encodeBase64(text);
      const [hash, encrypt] = await Promise.all([
        sha256Hex(text),
        encryptText(text, "demo-key"),
      ]);
      if (!alive) return;
      setOutputs({ encode, hash, encrypt });
    })();
    return () => {
      alive = false;
    };
  }, [text]);

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-2">
        <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          type once
        </label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-12 font-data text-base"
          placeholder="Type a message…"
        />
      </div>

      <div className="mt-4 space-y-2">
        {CONCEPT_ORDER.map((id) => {
          const c = CONCEPTS[id];
          const Icon = c.icon;
          return (
            <Link
              key={id}
              href={c.href}
              className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3.5 py-3 transition-colors hover:border-border"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md border",
                  c.accent.border,
                  c.accent.bgSoft,
                )}
              >
                <Icon className={cn("size-3.5", c.accent.text)} />
              </span>
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {c.name}
              </span>
              <AnimatePresence mode="wait">
                <motion.code
                  key={outputs[id]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex-1 truncate font-data text-[13px]",
                    c.accent.text,
                  )}
                >
                  {outputs[id] ? clip(outputs[id]) : "—"}
                </motion.code>
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 font-data text-[11px] leading-relaxed text-muted-foreground">
        Same input, three fates: encoding bounces back instantly, hashing
        becomes an irreversible fingerprint, encryption locks behind a key.
      </p>
    </div>
  );
}
