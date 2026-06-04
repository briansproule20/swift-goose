"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CONCEPTS, type ConceptId } from "@/lib/concepts";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; concept?: ConceptId }[] = [
  { href: "/playground", label: "Bench" },
  { href: "/learn/encoding", label: "Encoding", concept: "encode" },
  { href: "/learn/hashing", label: "Hashing", concept: "hash" },
  { href: "/learn/encryption", label: "Encryption", concept: "encrypt" },
];

/** A cubic salt-crystal glyph — outline cube, drawn small. */
function SaltMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 21 7v10l-9 5-9-5V7z" />
      <path d="M12 2v20M3 7l9 5 9-5" opacity="0.55" />
    </svg>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[5px] border border-border bg-card text-hash transition-colors group-hover:text-encode">
            <SaltMark className="size-4" />
          </span>
          <span className="font-display text-xl leading-none tracking-tight">
            Salt<span className="text-muted-foreground">works</span>
          </span>
        </Link>

        {/* desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-hash to-transparent" />
                )}
              </Link>
            );
          })}
        </div>

        {/* mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 gap-0 p-0">
            <SheetTitle className="flex items-center gap-2.5 border-b border-border px-5 py-4 font-display text-xl tracking-tight">
              <span className="grid size-7 place-items-center rounded-[5px] border border-border bg-card text-hash">
                <SaltMark className="size-3.5" />
              </span>
              Salt<span className="-ml-1.5 text-muted-foreground">works</span>
            </SheetTitle>
            <div className="flex flex-col p-3">
              {LINKS.map((link) => {
                const active = pathname === link.href;
                const accent = link.concept
                  ? CONCEPTS[link.concept].accent
                  : null;
                return (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                      />
                    }
                  >
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          accent ? "" : "bg-muted-foreground/50",
                        )}
                        style={
                          accent ? { background: accent.color } : undefined
                        }
                      />
                      {link.label}
                    </span>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
