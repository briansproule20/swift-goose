"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

type NavLink = { href: string; label: string; concept?: ConceptId };

const PRIMITIVE_LINKS: NavLink[] = [
  { href: "/learn/encoding", label: "Encoding", concept: "encode" },
  { href: "/learn/hashing", label: "Hashing", concept: "hash" },
  { href: "/learn/encryption", label: "Encryption", concept: "encrypt" },
];

const PROTOCOL_LINKS: NavLink[] = [
  { href: "/learn/signatures", label: "Signatures", concept: "sign" },
  { href: "/learn/key-exchange", label: "Key Exchange", concept: "exchange" },
  { href: "/learn/tls-handshake", label: "Handshake", concept: "handshake" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/salt-cube.png"
            alt="Saltworks"
            width={34}
            height={34}
            priority
            className="size-[34px] drop-shadow-[0_2px_10px_rgba(79,122,230,0.35)] transition-transform group-hover:scale-105"
          />
          <span className="font-display text-xl leading-none tracking-tight">
            Salt<span className="text-muted-foreground">works</span>
          </span>
        </Link>

        {/* desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          <DesktopLink
            href="/playground"
            label="Bench"
            active={pathname === "/playground"}
          />
          <Divider />
          {PRIMITIVE_LINKS.map((link) => (
            <DesktopLink
              key={link.href}
              {...link}
              active={pathname === link.href}
            />
          ))}
          <Divider />
          {PROTOCOL_LINKS.map((link) => (
            <DesktopLink
              key={link.href}
              {...link}
              active={pathname === link.href}
            />
          ))}
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
          <SheetContent side="right" className="w-72 gap-0 overflow-y-auto p-0">
            <SheetTitle className="flex items-center gap-2.5 border-b border-border px-5 py-4 font-display text-xl tracking-tight">
              <Image
                src="/salt-cube.png"
                alt=""
                width={28}
                height={28}
                className="size-7 drop-shadow-[0_2px_8px_rgba(79,122,230,0.35)]"
              />
              Salt<span className="text-muted-foreground">works</span>
            </SheetTitle>
            <div className="flex flex-col p-3">
              <MobileLink
                href="/playground"
                label="Bench"
                active={pathname === "/playground"}
                onClick={() => setOpen(false)}
              />
              <MobileGroup label="Primitives" />
              {PRIMITIVE_LINKS.map((link) => (
                <MobileLink
                  key={link.href}
                  {...link}
                  active={pathname === link.href}
                  onClick={() => setOpen(false)}
                />
              ))}
              <MobileGroup label="Protocols" />
              {PROTOCOL_LINKS.map((link) => (
                <MobileLink
                  key={link.href}
                  {...link}
                  active={pathname === link.href}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

function Divider() {
  return <span className="mx-1.5 h-4 w-px bg-border" aria-hidden />;
}

function DesktopLink({
  href,
  label,
  concept,
  active,
}: NavLink & { active: boolean }) {
  const color = concept ? CONCEPTS[concept].accent.color : "var(--hash)";
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active && (
        <span
          className="absolute inset-x-2.5 -bottom-px h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      )}
    </Link>
  );
}

function MobileGroup({ label }: { label: string }) {
  return (
    <span className="label-spec mt-3 mb-1 px-3 pt-2">{label}</span>
  );
}

function MobileLink({
  href,
  label,
  concept,
  active,
  onClick,
}: NavLink & { active: boolean; onClick: () => void }) {
  const accent = concept ? CONCEPTS[concept].accent : null;
  return (
    <SheetClose render={<Link href={href} onClick={onClick} />}>
      <span
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors",
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <span
          className={cn("size-2 rounded-full", accent ? "" : "bg-muted-foreground/50")}
          style={accent ? { background: accent.color } : undefined}
        />
        {label}
      </span>
    </SheetClose>
  );
}
