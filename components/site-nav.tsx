"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CONCEPTS,
  CONCEPT_ORDER,
  PRACTICE_ORDER,
  PROTOCOL_ORDER,
  type ConceptId,
} from "@/lib/concepts";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; concept: ConceptId };

const toLinks = (order: ConceptId[]): NavLink[] =>
  order.map((id) => ({
    href: CONCEPTS[id].href,
    label: CONCEPTS[id].name,
    concept: id,
  }));

const PRIMITIVE_LINKS = toLinks(CONCEPT_ORDER);
const PROTOCOL_LINKS = toLinks(PROTOCOL_ORDER);
const PRACTICE_LINKS = toLinks(PRACTICE_ORDER);

const TIERS: { label: string; links: NavLink[] }[] = [
  { label: "Primitives", links: PRIMITIVE_LINKS },
  { label: "Protocols", links: PROTOCOL_LINKS },
  { label: "Practice", links: PRACTICE_LINKS },
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
          <span className="mx-1.5 h-4 w-px bg-border" aria-hidden />
          {TIERS.map((t) => (
            <NavMenu
              key={t.label}
              label={t.label}
              links={t.links}
              pathname={pathname}
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
              {TIERS.map((t) => (
                <div key={t.label}>
                  <MobileGroup label={t.label} />
                  {t.links.map((link) => (
                    <MobileLink
                      key={link.href}
                      {...link}
                      active={pathname === link.href}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

function NavMenu({
  label,
  links,
  pathname,
}: {
  label: string;
  links: NavLink[];
  pathname: string;
}) {
  const active = links.some((l) => l.href === pathname);
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-[popup-open]:text-foreground",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        <ChevronDown className="size-3.5 opacity-50 transition-transform data-[popup-open]:rotate-180" />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={10} align="start" className="z-50">
          <MenuPrimitive.Popup className="min-w-60 origin-[var(--transform-origin)] rounded-xl border border-border bg-popover/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl outline-none">
            {links.map((l) => {
              const c = CONCEPTS[l.concept];
              const isActive = pathname === l.href;
              const Icon = c.icon;
              return (
                <MenuPrimitive.Item
                  key={l.href}
                  render={<Link href={l.href} />}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-md border",
                      c.accent.border,
                      c.accent.bgSoft,
                    )}
                  >
                    <Icon className={cn("size-3.5", c.accent.text)} />
                  </span>
                  {l.label}
                </MenuPrimitive.Item>
              );
            })}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}

function DesktopLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
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
        <span className="absolute inset-x-2.5 -bottom-px h-px bg-gradient-to-r from-transparent via-hash to-transparent" />
      )}
    </Link>
  );
}

function MobileGroup({ label }: { label: string }) {
  return <span className="label-spec mt-3 mb-1 block px-3 pt-2">{label}</span>;
}

function MobileLink({
  href,
  label,
  concept,
  active,
  onClick,
}: {
  href: string;
  label: string;
  concept?: ConceptId;
  active: boolean;
  onClick: () => void;
}) {
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
