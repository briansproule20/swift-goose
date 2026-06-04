"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/playground", label: "Lab" },
  { href: "/learn/encoding", label: "Encoding" },
  { href: "/learn/hashing", label: "Hashing" },
  { href: "/learn/encryption", label: "Encryption" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid size-8 place-items-center rounded-md border border-border bg-card">
            <FlaskConical className="size-4 text-encrypt transition-colors group-hover:text-hash" />
            <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-encrypt/20 transition group-hover:ring-hash/30" />
          </span>
          <span className="font-display text-xl leading-none tracking-tight">
            Cipher<span className="text-muted-foreground">Lab</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/playground"
                ? pathname === "/playground"
                : pathname === link.href;
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
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/70 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
