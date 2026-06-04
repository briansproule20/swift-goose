import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Aurora } from "@/components/aurora";
import { FeltIntro } from "@/components/felt-intro";
import { Button } from "@/components/ui/button";
import {
  CONCEPT_ORDER,
  CONCEPTS,
  PRACTICE_ORDER,
  PROTOCOL_ORDER,
} from "@/lib/concepts";
import { cn } from "@/lib/utils";

const ROWS = CONCEPT_ORDER.map((id) => CONCEPTS[id]);
const PROTOCOLS = PROTOCOL_ORDER.map((id) => CONCEPTS[id]);
const PRACTICE = PRACTICE_ORDER.map((id) => CONCEPTS[id]);

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <h1 className="grid w-fit grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1 font-display text-5xl leading-[1.04] tracking-tight sm:gap-x-5 sm:text-6xl lg:text-7xl">
              {ROWS.map((c) => (
                <Fragment key={c.id}>
                  <span>{c.name}</span>
                  <span className="self-baseline font-data text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                    {c.algorithm}
                  </span>
                </Fragment>
              ))}
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Three things that look similar and get confused constantly — with
              vastly different uses.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                render={<Link href="/playground" />}
                size="lg"
                className="group"
              >
                Open the bench
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                render={<Link href="/learn/encoding" />}
                size="lg"
                variant="outline"
              >
                Start with encoding
              </Button>
            </div>
          </div>

          <FeltIntro />
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="border-y border-border bg-card/20">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            Same input. Three different jobs.
          </h2>

          <div className="mt-10 overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_1.4fr] gap-px bg-border sm:grid">
              {["", "Reversible?", "Needs a key?", "What it's for"].map(
                (h, i) => (
                  <div key={i} className="label-spec bg-background px-5 py-3">
                    {h}
                  </div>
                ),
              )}
            </div>

            {ROWS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-[1.3fr_1fr_0.8fr_1.4fr]"
                >
                  <Link
                    href={c.href}
                    className="group flex items-center justify-between gap-3 bg-background px-5 py-5 transition-colors hover:bg-card/60"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-md border",
                          c.accent.border,
                          c.accent.bgSoft,
                        )}
                      >
                        <Icon className={cn("size-4.5", c.accent.text)} />
                      </span>
                      <span>
                        <span className="block font-display text-lg leading-tight">
                          {c.name}
                        </span>
                        <span
                          className={cn("font-data text-xs", c.accent.text)}
                        >
                          {c.algorithm}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>

                  <Cell label="Reversible?" value={c.reversible} />
                  <Cell label="Needs a key?" value={c.needsKey} />
                  <Cell label="What it's for" value={c.job} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Concept cards ── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-4xl tracking-tight">Each one, up close</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The idea, the math behind it, and something live to poke at.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ROWS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.id}
                href={c.href}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/40 p-6 transition-transform hover:-translate-y-1"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${c.accent.color}, transparent)`,
                  }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-lg border",
                      c.accent.border,
                      c.accent.bgSoft,
                    )}
                  >
                    <Icon className={cn("size-5", c.accent.text)} />
                  </span>
                  <span className="label-spec">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.oneLine}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
                  Open
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Protocols (the second tier) ── */}
      <section
        id="protocols"
        className="scroll-mt-20 border-t border-border bg-card/20"
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <span className="label-spec">tier 02</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight">
            Then they combine.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            On their own, the three above are building blocks. Snap them together
            and you get the protocols that actually run the internet — proving
            identity, agreeing on secrets, and opening a private line.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROTOCOLS.map((c, i) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  href={c.href}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/40 p-6 transition-transform hover:-translate-y-1"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${c.accent.color}, transparent)`,
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-lg border",
                        c.accent.border,
                        c.accent.bgSoft,
                      )}
                    >
                      <Icon className={cn("size-5", c.accent.text)} />
                    </span>
                    <span className="label-spec">
                      {c.id === "handshake" ? "capstone" : `0${i + 1}`}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.oneLine}
                  </p>
                  {c.builtFrom && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.builtFrom.map((id) => {
                        const b = CONCEPTS[id];
                        return (
                          <span
                            key={id}
                            className={cn(
                              "rounded-full border px-2 py-0.5 font-data text-[10px]",
                              b.accent.border,
                              b.accent.bgSoft,
                              b.accent.text,
                            )}
                          >
                            {b.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
                    Open
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Practice (the third tier) ── */}
      <section id="practice" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <span className="label-spec">tier 03</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight">
            And then humans show up.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The math is the easy part. The hard part is using it safely once real
            people pick weak passwords and databases get leaked. This is the
            craft of handling secrets without getting burned.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {PRACTICE.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  href={c.href}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/40 p-6 transition-transform hover:-translate-y-1"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${c.accent.color}, transparent)`,
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-lg border",
                        c.accent.border,
                        c.accent.bgSoft,
                      )}
                    >
                      <Icon className={cn("size-5", c.accent.text)} />
                    </span>
                    <span className={cn("font-data text-xs", c.accent.text)}>
                      {c.algorithm}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.oneLine}
                  </p>
                  {c.builtFrom && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.builtFrom.map((id) => {
                        const b = CONCEPTS[id];
                        return (
                          <span
                            key={id}
                            className={cn(
                              "rounded-full border px-2 py-0.5 font-data text-[10px]",
                              b.accent.border,
                              b.accent.bgSoft,
                              b.accent.text,
                            )}
                          >
                            {b.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
                    Open
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Close ── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card/40 px-8 py-14 text-center lab-frame sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Have a go
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              One input through all three at once. Nothing leaves your browser.
            </p>
          </div>
          <Button
            render={<Link href="/playground" />}
            size="lg"
            className="group shrink-0"
          >
            Open the bench
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </section>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-background px-5 py-4 sm:py-5">
      <span className="label-spec sm:hidden">{label}:</span>
      <span className="text-sm text-foreground/85">{value}</span>
    </div>
  );
}
