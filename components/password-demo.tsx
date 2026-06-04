"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  buildRainbowTable,
  hashPassword,
  naiveHashHex,
  verifyPassword,
} from "@/lib/passwords";
import { cn } from "@/lib/utils";

type Mode = "naive" | "salted";

const USERS = [
  { name: "alice", password: "password123" },
  { name: "bob", password: "password123" }, // same password as alice!
  { name: "carol", password: "tr0ub4dor-7" },
];

function shorten(s: string, n = 22): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function PasswordDemo() {
  const [mode, setMode] = useState<Mode>("naive");
  const [naive, setNaive] = useState<Record<string, string>>({});
  const [salted, setSalted] = useState<Record<string, string>>({});
  const [rainbow, setRainbow] = useState<Map<string, string>>(new Map());

  const [login, setLogin] = useState("tr0ub4dor-7");
  const [loginResult, setLoginResult] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const naiveEntries: Record<string, string> = {};
      const saltedEntries: Record<string, string> = {};
      await Promise.all(
        USERS.map(async (u) => {
          naiveEntries[u.name] = await naiveHashHex(u.password);
          saltedEntries[u.name] = await hashPassword(u.password);
        }),
      );
      const table = await buildRainbowTable();
      if (!alive) return;
      setNaive(naiveEntries);
      setSalted(saltedEntries);
      setRainbow(table);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Verify the login attempt against carol's salted record, live.
  useEffect(() => {
    const record = salted["carol"];
    if (!record) return;
    let alive = true;
    (async () => {
      const ok = await verifyPassword(login, record);
      if (alive) setLoginResult(ok);
    })();
    return () => {
      alive = false;
    };
  }, [login, salted]);

  const aliceHash = naive["alice"];
  const bobHash = naive["bob"];
  const collide = aliceHash && aliceHash === bobHash;

  return (
    <div className="space-y-4">
      {/* the leaked database */}
      <div className="rounded-xl border border-passwords/30 bg-card/50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-passwords">
            <ShieldAlert className="size-4" />
            <span className="font-data text-[11px]">
              a leaked user table — stored as:
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-border p-0.5">
            {(["naive", "salted"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-3 py-1 font-data text-[11px] transition-colors",
                  mode === m
                    ? m === "naive"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-passwords-soft text-passwords"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "naive" ? "bare SHA-256" : "salted PBKDF2"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {USERS.map((u) => {
            const stored = mode === "naive" ? naive[u.name] : salted[u.name];
            const cracked =
              mode === "naive" && stored ? rainbow.get(stored) : undefined;
            const isCollision =
              mode === "naive" && collide && (u.name === "alice" || u.name === "bob");
            return (
              <div
                key={u.name}
                className={cn(
                  "rounded-lg border bg-background/50 p-3",
                  isCollision ? "border-destructive/40" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-data text-[13px] text-foreground/90">
                    {u.name}
                  </span>
                  <span className="font-data text-[11px] break-all text-muted-foreground/80">
                    {stored ? shorten(stored) : "…"}
                  </span>
                </div>
                {mode === "naive" && (
                  <p className="mt-1.5 font-data text-[11px]">
                    {cracked ? (
                      <span className="text-destructive">
                        rainbow table → cracked: “{cracked}”
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        not in the common-password table — yet
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "mt-4 flex items-start gap-2.5 rounded-lg border p-3.5",
            mode === "naive"
              ? "border-destructive/40 bg-destructive/5"
              : "border-passwords/40 bg-passwords-soft",
          )}
        >
          {mode === "naive" ? (
            <>
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="font-data text-[11px] leading-relaxed text-destructive/90">
                Alice and Bob chose the same password, so their stored hashes are{" "}
                <strong>identical</strong> — the leak reveals that. And a
                precomputed table cracks every common password instantly. Bare
                hashing is barely better than plaintext.
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-passwords" />
              <p className="font-data text-[11px] leading-relaxed text-foreground/80">
                Now every row is unique — even Alice and Bob, with the same
                password, store different records, because each got its own salt.
                The rainbow table is useless, and each guess must be re-run, slowly,
                per user.
              </p>
            </>
          )}
        </div>
      </div>

      {/* logging in without ever storing the secret */}
      <div className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
        <p className="label-spec mb-3">log in as carol — verified, never stored</p>
        <Input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="font-data"
          placeholder="password…"
        />
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg border p-3",
            loginResult
              ? "border-passwords/40 bg-passwords-soft text-passwords"
              : "border-destructive/40 bg-destructive/5 text-destructive",
          )}
        >
          {loginResult ? (
            <>
              <CheckCircle2 className="size-4" />
              <span className="font-data text-[12px]">
                Access granted — the guess re-derived the stored hash.
              </span>
            </>
          ) : (
            <>
              <XCircle className="size-4" />
              <span className="font-data text-[12px]">
                Rejected — the re-derived hash doesn&apos;t match the record.
              </span>
            </>
          )}
        </div>
        <p className="mt-2 font-data text-[11px] text-muted-foreground">
          The server compares hashes, not passwords. It could not tell you
          carol&apos;s password if it tried — it doesn&apos;t have it.
        </p>
      </div>
    </div>
  );
}
