import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p className="font-data text-xs">
          Everything runs in your browser ·{" "}
          <span className="text-foreground/80">crypto.subtle</span> ·{" "}
          <span className="text-foreground/80">no backend</span> ·{" "}
          <span className="text-foreground/80">no secrets stored</span>
        </p>
        <div className="flex items-center gap-5">
          <Link href="/playground" className="transition-colors hover:text-foreground">
            Lab
          </Link>
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Web Crypto API
          </a>
        </div>
      </div>
    </footer>
  );
}
