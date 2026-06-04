"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Shuffle } from "lucide-react";
import { TransformCard } from "@/components/transform-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { encodeBase64, base64Overhead } from "@/lib/encode";
import { sha256Hex } from "@/lib/hash";
import { decryptText, encryptText, suggestPassphrase } from "@/lib/encrypt";
import { cn } from "@/lib/utils";

export function Playground() {
  const [input, setInput] = useState("We Ride for Gondor");
  const [passphrase, setPassphrase] = useState("and war");
  const [showKey, setShowKey] = useState(false);
  const [wrongKey, setWrongKey] = useState(false);

  // synchronous: encoding
  const encodeOut = input ? encodeBase64(input) : "";
  const overhead = base64Overhead(input);

  // async: hashing + encryption
  const [hashOut, setHashOut] = useState("");
  const [cipherOut, setCipherOut] = useState("");
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [wrongKeyError, setWrongKeyError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!input) {
        if (alive) {
          setHashOut("");
          setCipherOut("");
          setDecrypted(null);
          setWrongKeyError(null);
        }
        return;
      }
      const hash = await sha256Hex(input);
      const cipher = await encryptText(input, passphrase || " ");
      // round-trip with the right key, and an intentional failure with a wrong one
      const right = await decryptText(cipher, passphrase || " ");
      const wrong = await decryptText(cipher, (passphrase || " ") + "x");
      if (!alive) return;
      setHashOut(hash);
      setCipherOut(cipher);
      setDecrypted(right.ok ? right.text : null);
      setWrongKeyError(wrong.ok ? null : wrong.error);
    })();
    return () => {
      alive = false;
    };
  }, [input, passphrase]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="max-w-2xl">
        <span className="label-spec">The bench</span>
        <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
          One input, three outputs
        </h1>
        <p className="mt-4 text-muted-foreground">
          Type below. Each panel updates as you go. Nothing leaves your browser.
        </p>
      </header>

      {/* shared input */}
      <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card/40 p-5 sm:p-6 md:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-2">
          <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
            message
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to transform…"
            className="min-h-24 resize-none font-data text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
            encryption key
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-encrypt" />
            <Input
              type={showKey ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="a secret passphrase"
              className="px-9 font-data"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setPassphrase(suggestPassphrase());
              setShowKey(true);
            }}
            className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Shuffle className="size-3.5" />
            Suggest a random key
          </button>
        </div>
      </div>

      {/* three transforms */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <TransformCard
          conceptId="encode"
          output={encodeOut}
          state={input ? "ok" : "empty"}
          note={
            input ? (
              <span>
                Reverses instantly, no key needed.{" "}
                <span className="text-foreground/80">
                  {overhead.inputBytes} bytes → {overhead.outputChars} chars
                </span>{" "}
                (+
                {Math.round((overhead.ratio - 1) * 100)}% — Base64&apos;s cost).
              </span>
            ) : (
              "Translation into a safe alphabet — not a secret."
            )
          }
        />

        <TransformCard
          conceptId="hash"
          output={hashOut}
          state={input ? "ok" : "empty"}
          note={
            input ? (
              <span>
                Always 256 bits, no matter the input length. Change one
                character and ~half these digits change — with no way back.
              </span>
            ) : (
              "A one-way fingerprint — fixed size, no way back."
            )
          }
        />

        <TransformCard
          conceptId="encrypt"
          output={cipherOut}
          state={input ? "ok" : "empty"}
          note={
            input ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2">
                  <span className="text-xs">Decrypt with a wrong key</span>
                  <Switch
                    checked={wrongKey}
                    onCheckedChange={setWrongKey}
                  />
                </div>
                {wrongKey ? (
                  <p className="font-data text-xs text-destructive">
                    ✗ {wrongKeyError ?? "Decryption failed."}
                  </p>
                ) : (
                  <p className="font-data text-xs text-encode">
                    unlocks with your key →{" "}
                    <span className="text-foreground/80">
                      “{decrypted ?? "…"}”
                    </span>
                  </p>
                )}
              </div>
            ) : (
              "Two-way scrambling that needs the right key to undo."
            )
          }
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-xs",
              "bg-encrypt-soft text-encrypt",
            )}
          >
            <KeyRound className="size-3.5" />
            Fresh salt + IV every run — same key, different ciphertext.
          </div>
        </TransformCard>
      </div>

      <p className="mt-8 text-center font-data text-xs text-muted-foreground">
        New to this? Start with{" "}
        <a
          href="/learn/encoding"
          className="text-foreground/80 underline-offset-4 hover:underline"
        >
          encoding
        </a>
        .
      </p>
    </div>
  );
}
