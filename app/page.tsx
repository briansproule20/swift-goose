import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Aurora } from "@/components/aurora";
import { FeltIntro } from "@/components/felt-intro";
import { Button } from "@/components/ui/button";
import { CONCEPT_ORDER, CONCEPTS } from "@/lib/concepts";
import { cn } from "@/lib/utils";

const TABLE_ROWS = CONCEPT_ORDER.map((id) => CONCEPTS[id]);

export default function Home() {
  return (
    <>
      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-data text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-hash" />
              runs entirely in your browser · Web Crypto API
            </span>

            <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight sm:text-7xl">
              Encoding,
              <br />
              hashing &amp;
              <br />
              <span className="italic text-encrypt text-glow-encrypt">
                encryption
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Three things everyone confuses — because they all look like
              “scrambling.” Type one input, watch all three transform it side by
              side, and finally <em className="text-foreground/90">feel</em> the
              difference.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                render={<Link href="/playground" />}
                size="lg"
                className="group"
              >
                Open the Lab
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                render={<Link href="/learn/encoding" />}
                size="lg"
                variant="outline"
              >
                Start the lessons
              </Button>
            </div>
          </div>

          <FeltIntro />
        </div>
      </section>

      {/* ───────────────── Comparison table ───────────────── */}
      <section className="border-y border-border/60 bg-card/20">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              They look alike. They do
              <span className="italic"> opposite jobs.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              The whole site exists to make this table felt rather than
              memorized.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            {/* header row */}
            <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_1.4fr] gap-px bg-border sm:grid">
              {["", "Reversible?", "Needs a key?", "Its actual job"].map(
                (h, i) => (
                  <div
                    key={i}
                    className="bg-background px-5 py-3 font-data text-[11px] uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </div>
                ),
              )}
            </div>

            {TABLE_ROWS.map((c) => {
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
                          "grid size-9 place-items-center rounded-lg border",
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
                  <Cell label="Its actual job" value={c.job} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── Lesson teaser cards ───────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-4xl tracking-tight">
          Three short lessons
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Conceptual, not cryptographic engineering — each ends in a live demo
          you can poke at.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TABLE_ROWS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.id}
                href={c.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-transform hover:-translate-y-1"
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
                      "grid size-11 place-items-center rounded-xl border",
                      c.accent.border,
                      c.accent.bgSoft,
                    )}
                  >
                    <Icon className={cn("size-5", c.accent.text)} />
                  </span>
                  <span className="font-data text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.oneLine}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
                  Read the lesson
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────────── Final CTA ───────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 px-8 py-16 text-center lab-frame">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            Stop memorizing. Start typing.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            One input, three transforms, zero backend. See encoding bounce back,
            hashing explode, and encryption refuse the wrong key.
          </p>
          <Button
            render={<Link href="/playground" />}
            size="lg"
            className="mt-8 group"
          >
            Enter the Lab
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
      <span className="font-data text-[10px] uppercase tracking-wider text-muted-foreground sm:hidden">
        {label}:
      </span>
      <span className="text-sm text-foreground/85">{value}</span>
    </div>
  );
}
