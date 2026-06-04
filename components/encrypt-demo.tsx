"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Unlock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { decryptText, encryptText } from "@/lib/encrypt";
import { cn } from "@/lib/utils";

export function EncryptDemo() {
  const [message, setMessage] = useState("meet me at the docks");
  const [lockKey, setLockKey] = useState("swordfish");
  const [unlockKey, setUnlockKey] = useState("swordfish");

  const [cipher, setCipher] = useState("");
  const [result, setResult] = useState<
    { ok: true; text: string } | { ok: false; error: string } | null
  >(null);

  // encrypt whenever message or the locking key changes
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!message) {
        if (alive) setCipher("");
        return;
      }
      const c = await encryptText(message, lockKey || " ");
      if (alive) setCipher(c);
    })();
    return () => {
      alive = false;
    };
  }, [message, lockKey]);

  // attempt to decrypt with whatever the user put in the unlock field
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!cipher) {
        if (alive) setResult(null);
        return;
      }
      const r = await decryptText(cipher, unlockKey || " ");
      if (alive) setResult(r);
    })();
    return () => {
      alive = false;
    };
  }, [cipher, unlockKey]);

  const keysMatch = lockKey === unlockKey;

  return (
    <div className="rounded-xl border border-encrypt/30 bg-card/50 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="message" value={message} onChange={setMessage} mono />
        <Field
          label="lock with this key"
          value={lockKey}
          onChange={setLockKey}
        />
      </div>

      <div className="mt-5 flex items-center gap-2 text-encrypt">
        <Lock className="size-4" />
        <span className="font-data text-[11px]">AES-GCM ciphertext</span>
      </div>
      <div className="mt-2 rounded-lg border border-border bg-background/50 p-3.5">
        <div className="mb-2 flex items-center justify-end">
          {cipher && <CopyButton value={cipher} />}
        </div>
        <p className="font-data text-[13px] leading-relaxed break-all text-encrypt">
          {cipher || "—"}
        </p>
      </div>

      <div className="mt-5 max-w-xs">
        <Field
          label="unlock with this key"
          value={unlockKey}
          onChange={setUnlockKey}
        />
      </div>

      <div
        className={cn(
          "mt-4 flex items-start gap-3 rounded-lg border p-4",
          result?.ok
            ? "border-hash/40 bg-hash-soft"
            : "border-destructive/40 bg-destructive/5",
        )}
      >
        {result?.ok ? (
          <>
            <Unlock className="mt-0.5 size-5 shrink-0 text-hash" />
            <div>
              <p className="flex items-center gap-1.5 font-display text-lg leading-none text-hash">
                <CheckCircle2 className="size-4" /> Decrypted
              </p>
              <p className="mt-2 font-data text-sm text-foreground/90">
                “{result.text}”
              </p>
            </div>
          </>
        ) : (
          <>
            <Lock className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="flex items-center gap-1.5 font-display text-lg leading-none text-destructive">
                <XCircle className="size-4" /> Failed
              </p>
              <p className="mt-2 font-data text-sm text-destructive/90">
                {result?.error ?? "Decryption failed."}
              </p>
            </div>
          </>
        )}
      </div>

      <p className="mt-3 font-data text-[11px] text-muted-foreground">
        {keysMatch
          ? "Keys match — recovery works. Change the unlock key by one character to watch it fail."
          : "Keys differ — GCM detects it and refuses. No partial answer, no garbage. Just: no."}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={mono ? "font-data" : undefined}
      />
    </div>
  );
}
