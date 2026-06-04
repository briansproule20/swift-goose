"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { CONCEPTS } from "@/lib/concepts";
import {
  type HandshakeResult,
  type HandshakeStep,
  type StepPrimitive,
  runHandshake,
} from "@/lib/handshake";
import { cn } from "@/lib/utils";

type Mode = "honest" | "tamper";

export function HandshakeWalkthrough() {
  const [mode, setMode] = useState<Mode>("honest");
  const [result, setResult] = useState<HandshakeResult | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async (m: Mode) => {
    if (timer.current) clearTimeout(timer.current);
    const r = await runHandshake({ tamper: m === "tamper" });
    setResult(r);
    setRevealed(1);
    setPlaying(true);
  }, []);

  // Run the first (honest) handshake once on mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await runHandshake({ tamper: false });
      if (!alive) return;
      setResult(r);
      setRevealed(1);
      setPlaying(true);
    })();
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Auto-advance while playing. Once every step is revealed we simply stop
  // scheduling — the UI keys off `done`, so there's no end-state to set here.
  useEffect(() => {
    if (!playing || !result) return;
    if (revealed >= result.steps.length) return;
    timer.current = setTimeout(() => setRevealed((n) => n + 1), 1050);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, revealed, result]);

  const setModeAndRun = (m: Mode) => {
    setMode(m);
    start(m);
  };

  if (!result) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-handshake/20 bg-card/40" />
    );
  }

  const total = result.steps.length;
  const done = revealed >= total;

  return (
    <div className="rounded-xl border border-handshake/30 bg-card/50 p-5 sm:p-6">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {(["honest", "tamper"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModeAndRun(m)}
              className={cn(
                "rounded-md px-3 py-1 font-data text-[11px] transition-colors",
                mode === m
                  ? m === "tamper"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-handshake-soft text-handshake"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "honest" ? "honest server" : "impersonator"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Ctrl
            onClick={() => {
              setPlaying(false);
              setRevealed((n) => Math.max(1, n - 1));
            }}
            disabled={revealed <= 1}
            aria-label="previous step"
          >
            <ChevronLeft className="size-4" />
          </Ctrl>
          <span className="w-14 text-center font-data text-[11px] text-muted-foreground">
            {Math.min(revealed, total)} / {total}
          </span>
          {done ? (
            <Ctrl onClick={() => start(mode)} aria-label="replay">
              <RotateCcw className="size-3.5" />
            </Ctrl>
          ) : playing ? (
            <Ctrl onClick={() => setPlaying(false)} aria-label="pause">
              <span className="block h-3 w-3 rounded-[2px] border-2 border-current" />
            </Ctrl>
          ) : (
            <Ctrl onClick={() => setPlaying(true)} aria-label="play">
              <Play className="size-3.5" />
            </Ctrl>
          )}
          <Ctrl
            onClick={() => {
              setPlaying(false);
              setRevealed((n) => Math.min(total, n + 1));
            }}
            disabled={done}
            aria-label="next step"
          >
            <ChevronRight className="size-4" />
          </Ctrl>
        </div>
      </div>

      {/* column headers */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-b border-border pb-2">
        <span className="label-spec">client · your browser</span>
        <span className="label-spec text-right">server · saltworks.dev</span>
      </div>

      {/* the trace */}
      <ol className="mt-3 space-y-2.5">
        {result.steps.slice(0, revealed).map((step, i) => (
          <StepRow key={step.id} step={step} index={i} />
        ))}
      </ol>

      {/* outcome */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {result.ok ? (
              <Established result={result} />
            ) : (
              <Refused />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ALIGN: Record<HandshakeStep["side"], string> = {
  client: "mr-auto items-start text-left",
  server: "ml-auto items-end text-right",
  both: "mx-auto items-center text-center",
  wire: "mx-auto items-center text-center",
};

function StepRow({ step, index }: { step: HandshakeStep; index: number }) {
  const fromX = step.side === "server" ? 24 : step.side === "client" ? -24 : 0;
  return (
    <motion.li
      initial={{ opacity: 0, x: fromX, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay: index === 0 ? 0 : 0.04 }}
      className={cn(
        "flex w-[88%] flex-col gap-1.5 rounded-lg border bg-background/50 p-3.5 sm:w-[78%]",
        ALIGN[step.side],
        step.failure
          ? "border-destructive/45 bg-destructive/5"
          : "border-border",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          step.side === "server" && "flex-row-reverse",
        )}
      >
        <span className="label-spec">{step.record}</span>
        <PrimitiveChip primitive={step.primitive} />
      </div>
      <p
        className={cn(
          "font-display text-[15px] leading-snug",
          step.failure ? "text-destructive" : "text-foreground",
        )}
      >
        {step.title}
      </p>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {step.detail}
      </p>
      {step.value && (
        <p
          className={cn(
            "mt-0.5 font-data text-[11px] break-all",
            step.failure
              ? "text-destructive"
              : step.value === "VALID ✓"
                ? "text-sign"
                : "text-foreground/70",
          )}
        >
          {step.value}
        </p>
      )}
    </motion.li>
  );
}

function PrimitiveChip({ primitive }: { primitive: StepPrimitive }) {
  if (!primitive) return null;
  const c = CONCEPTS[primitive];
  const Icon = c.icon;
  return (
    <Link
      href={c.href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-data text-[10px] transition-colors hover:bg-background/60",
        c.accent.border,
        c.accent.bgSoft,
        c.accent.text,
      )}
    >
      <Icon className="size-2.5" />
      {c.name}
    </Link>
  );
}

function Established({ result }: { result: HandshakeResult }) {
  return (
    <div className="rounded-lg border border-handshake/45 bg-handshake-soft p-4">
      <div className="flex items-center gap-2 text-handshake">
        <ShieldCheck className="size-5" />
        <p className="font-display text-lg leading-none">
          Secure channel established
        </p>
      </div>
      <dl className="mt-4 space-y-2.5">
        <Row label="server certificate" value={result.serverIdentityFingerprint} />
        <Row label="AES-GCM session key" value={result.sessionKeyFingerprint ?? ""} />
      </dl>
      <div className="mt-4 rounded-md border border-border bg-background/50 p-3">
        <span className="flex items-center gap-1.5 label-spec">
          <Lock className="size-3 text-handshake" />
          first request — sealed, then read by the server
        </span>
        <p className="mt-2 font-data text-[11px] text-muted-foreground">
          {result.request.replace(/\r\n/g, " ↵ ")}
        </p>
        <p className="mt-2 font-data text-[11px] break-all text-handshake">
          {result.ciphertext?.slice(0, 64)} …
        </p>
        {result.decrypted && (
          <p className="mt-2 font-data text-[11px] text-foreground/75">
            server decrypts → “{result.decrypted.replace(/\r\n/g, " ↵ ")}”
          </p>
        )}
      </div>
    </div>
  );
}

function Refused() {
  return (
    <div className="rounded-lg border border-destructive/45 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 text-destructive">
        <ShieldX className="size-5" />
        <p className="font-display text-lg leading-none">Connection refused</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-destructive/90">
        The certificate signature didn&apos;t check out, so the client never
        derived a key, never sent a byte of real data, and showed no padlock.
        The one thing an attacker can&apos;t fake is a signature for a
        certificate they don&apos;t own — and that single check guards the whole
        connection.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="label-spec">{label}</dt>
      <dd className="font-data text-[11px] break-all text-foreground/80">
        {value}
      </dd>
    </div>
  );
}

function Ctrl({
  children,
  onClick,
  disabled,
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  );
}
