"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { FlaskConical, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONCEPTS,
  CONCEPT_ORDER,
  PRACTICE_ORDER,
  PROTOCOL_ORDER,
  type ConceptId,
} from "@/lib/concepts";
import { cn } from "@/lib/utils";

const TIERS: { label: string; ids: ConceptId[] }[] = [
  { label: "Primitives", ids: CONCEPT_ORDER },
  { label: "Protocols", ids: PROTOCOL_ORDER },
  { label: "Practice", ids: PRACTICE_ORDER },
];

export function SiteNav() {
  const pathname = usePathname();

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

        <MenuPrimitive.Root>
          <MenuPrimitive.Trigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="data-[popup-open]:bg-muted"
              />
            }
          >
            <MenuIcon className="size-5" />
          </MenuPrimitive.Trigger>

          <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
              sideOffset={10}
              align="end"
              className="z-50"
            >
              <MenuPrimitive.Popup className="min-w-[16rem] origin-[var(--transform-origin)] rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <MenuRow
                  href="/playground"
                  label="Bench"
                  active={pathname === "/playground"}
                  icon={<FlaskConical className="size-3.5 text-muted-foreground" />}
                  chipClass="border-border bg-secondary/40"
                />

                {TIERS.map((t) => (
                  <Fragment key={t.label}>
                    <MenuPrimitive.Separator className="mx-2 my-1.5 h-px bg-border" />
                    <MenuPrimitive.Group>
                      <MenuPrimitive.GroupLabel className="label-spec block px-3 pt-1 pb-1.5">
                        {t.label}
                      </MenuPrimitive.GroupLabel>
                      {t.ids.map((id) => {
                        const c = CONCEPTS[id];
                        const Icon = c.icon;
                        return (
                          <MenuRow
                            key={id}
                            href={c.href}
                            label={c.name}
                            active={pathname === c.href}
                            icon={<Icon className={cn("size-3.5", c.accent.text)} />}
                            chipClass={cn(c.accent.border, c.accent.bgSoft)}
                          />
                        );
                      })}
                    </MenuPrimitive.Group>
                  </Fragment>
                ))}
              </MenuPrimitive.Popup>
            </MenuPrimitive.Positioner>
          </MenuPrimitive.Portal>
        </MenuPrimitive.Root>
      </nav>
    </header>
  );
}

function MenuRow({
  href,
  label,
  active,
  icon,
  chipClass,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
  chipClass: string;
}) {
  return (
    <MenuPrimitive.Item
      render={<Link href={href} />}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md border",
          chipClass,
        )}
      >
        {icon}
      </span>
      {label}
      {active && (
        <span className="ml-auto size-1.5 rounded-full bg-foreground/60" />
      )}
    </MenuPrimitive.Item>
  );
}
