import { type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Layers, Lightbulb } from "lucide-react";
import {
  CONCEPTS,
  type ConceptId,
  tierOrder,
} from "@/lib/concepts";
import { cn } from "@/lib/utils";

export function LessonHeader({
  conceptId,
  children,
}: {
  conceptId: ConceptId;
  children?: ReactNode;
}) {
  const c = CONCEPTS[conceptId];
  const Icon = c.icon;
  const order = tierOrder(c.tier);
  const index = order.indexOf(conceptId) + 1;
  const total = order.length;

  return (
    <header className="relative border-b border-border/60">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="label-spec">
            {c.tier} · 0{index} / 0{total}
          </span>
          <span className="h-px w-8 bg-border" />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
              c.accent.border,
              c.accent.bgSoft,
              c.accent.text,
            )}
          >
            <Icon className="size-3.5" />
            {c.algorithm}
          </span>
        </div>

        <h1 className="mt-6 font-display text-5xl tracking-tight sm:text-6xl">
          {c.name}
        </h1>
        <p className={cn("mt-4 text-lg text-muted-foreground")}>{c.oneLine}</p>

        {c.builtFrom && c.builtFrom.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="label-spec inline-flex items-center gap-1.5">
              <Layers className="size-3" />
              built from
            </span>
            {c.builtFrom.map((id) => {
              const b = CONCEPTS[id];
              const BIcon = b.icon;
              return (
                <Link
                  key={id}
                  href={b.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-background/40",
                    b.accent.border,
                    b.accent.bgSoft,
                    b.accent.text,
                  )}
                >
                  <BIcon className="size-3" />
                  {b.name}
                </Link>
              );
            })}
          </div>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function LessonBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="space-y-12">{children}</div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: "note" | "trap";
  title: string;
  children: ReactNode;
}) {
  const isTrap = tone === "trap";
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        isTrap
          ? "border-destructive/40 bg-destructive/5"
          : "border-encode/40 bg-encode-soft",
      )}
    >
      <div className="flex items-center gap-2">
        {isTrap ? (
          <AlertTriangle className="size-4 text-destructive" />
        ) : (
          <Lightbulb className="size-4 text-encode" />
        )}
        <h3
          className={cn(
            "font-display text-lg leading-none",
            isTrap ? "text-destructive" : "text-encode",
          )}
        >
          {title}
        </h3>
      </div>
      <div className="mt-3 text-[15px] leading-relaxed text-foreground/85">
        {children}
      </div>
    </div>
  );
}

/** A small terminal-style code line for inline examples. */
export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-secondary px-1.5 py-0.5 font-data text-[13px] text-foreground/90">
      {children}
    </code>
  );
}

export function LessonFooterNav({ conceptId }: { conceptId: ConceptId }) {
  const c = CONCEPTS[conceptId];
  const others = tierOrder(c.tier).filter((id) => id !== conceptId);
  const isProtocol = c.tier === "protocol";

  return (
    <nav className="mx-auto max-w-3xl px-5 pb-20">
      <div className="rounded-xl border border-border bg-card/40 p-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((id) => {
            const o = CONCEPTS[id];
            const Icon = o.icon;
            return (
              <Link
                key={id}
                href={o.href}
                className="group flex items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-border hover:bg-background/40"
              >
                <span className="flex items-center gap-3">
                  <Icon className={cn("size-4", o.accent.text)} />
                  <span>
                    <span className="label-spec block">
                      {isProtocol ? "protocol" : "next"}
                    </span>
                    <span className="font-display text-lg leading-tight">
                      {o.name}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
        <Link
          href={isProtocol ? "/#protocols" : "/playground"}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-secondary/60 p-3 text-sm transition-colors hover:bg-secondary"
        >
          {isProtocol ? "All the protocols" : "All three on the bench"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
