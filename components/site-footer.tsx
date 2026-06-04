import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p className="label-spec">
          Saltworks · runs in the browser · crypto.subtle
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/playground"
            className="transition-colors hover:text-foreground"
          >
            Bench
          </Link>
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Web Crypto API
          </a>
          <a
            href="https://github.com/briansproule20/swift-goose"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
