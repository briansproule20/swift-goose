"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Dices, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deriveKeyHex, randomSalt, saltHex } from "@/lib/kdf";
import { cn } from "@/lib/utils";

const ITER = 100_000;

function groom(hex: string): string {
  return hex.slice(0, 32).replace(/(.{4})/g, "$1 ").trim() + " …";
}

export function KdfDemo() {
  const [password, setPassword] = useState("swordfish");
  const [saltA, setSaltA] = useState<Uint8Array | null>(null);
  const [saltB, setSaltB] = useState<Uint8Array | null>(null);
  const [keyA, setKeyA] = useState("");
  const [keyB, setKeyB] = useState("");

  // Generate the two salts on first run, then re-derive whenever the password
  // or either salt changes. Salt generation lives inside the async body so it
  // never runs during render (crypto is browser-only) and never blocks paint.
  useEffect(() => {
    let alive = true;
    (async () => {
      const sA = saltA ?? randomSalt(16);
      const sB = saltB ?? randomSalt(16);
      const pw = password || " ";
      const [a, b] = await Promise.all([
        deriveKeyHex(pw, sA, ITER),
        deriveKeyHex(pw, sB, ITER),
      ]);
      if (!alive) return;
      if (!saltA) setSaltA(sA);
      if (!saltB) setSaltB(sB);
      setKeyA(a);
      setKeyB(b);
    })();
    return () => {
      alive = false;
    };
  }, [password, saltA, saltB]);

  const differ = keyA && keyB && keyA !== keyB;

  return (
    <div className="rounded-xl border border-salt/30 bg-card/50 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-salt">
        <KeyRound className="size-4" />
        <span className="font-data text-[11px]">
          PBKDF2 · {ITER.toLocaleString()} iterations · SHA-256
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          one password, used by two people
        </label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="font-data"
          placeholder="type a password…"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Lane
          name="Alice"
          salt={saltA}
          derived={keyA}
          onReroll={() => setSaltA(randomSalt(16))}
        />
        <Lane
          name="Bob"
          salt={saltB}
          derived={keyB}
          onReroll={() => setSaltB(randomSalt(16))}
        />
      </div>

      <div
        className={cn(
          "mt-3 rounded-lg border p-4",
          differ ? "border-salt/40 bg-salt-soft" : "border-border",
        )}
      >
        {differ ? (
          <motion.p
            key={keyA + keyB}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-display text-base text-salt"
          >
            <Check className="size-4" />
            Same password — two different keys.
          </motion.p>
        ) : (
          <p className="font-data text-[12px] text-muted-foreground">deriving…</p>
        )}
        <p className="mt-2 font-data text-[11px] leading-relaxed text-muted-foreground">
          The only difference between the two lanes is the salt. That&apos;s why
          an attacker can&apos;t precompute one table of password→key and reuse
          it: every salt needs its own table, and there are 2¹²⁸ of them.
        </p>
      </div>
    </div>
  );
}

function Lane({
  name,
  salt,
  derived,
  onReroll,
}: {
  name: string;
  salt: Uint8Array | null;
  derived: string;
  onReroll: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg">{name}</span>
        <button
          type="button"
          onClick={onReroll}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-data text-[10px] text-muted-foreground transition-colors hover:border-salt/50 hover:text-salt"
        >
          <Dices className="size-3" />
          new salt
        </button>
      </div>
      <div className="mt-2">
        <span className="label-spec">salt · public, per-user</span>
        <p className="mt-0.5 font-data text-[11px] break-all text-muted-foreground/80">
          {salt ? groom(saltHex(salt)) : "…"}
        </p>
      </div>
      <div className="mt-2.5">
        <span className="label-spec">derived key</span>
        <p className="mt-0.5 font-data text-[12px] break-all text-salt">
          {derived ? groom(derived) : "…"}
        </p>
      </div>
    </div>
  );
}
