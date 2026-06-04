"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  PenLine,
  RefreshCw,
  ShieldX,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import {
  generateSigningKeyPair,
  publicKeyFingerprint,
  signText,
  verifyText,
} from "@/lib/sign";
import { cn } from "@/lib/utils";

type VerifyWith = "owner" | "imposter";

const START_MESSAGE = "I authorize the transfer of 100 credits.";

interface Identities {
  owner: CryptoKeyPair;
  imposter: CryptoKeyPair;
  ownerPrint: string;
  imposterPrint: string;
  signature: string;
}

/** Two fresh ECDSA identities plus a signature over the starting message. */
async function freshIdentities(): Promise<Identities> {
  const [owner, imposter] = await Promise.all([
    generateSigningKeyPair(),
    generateSigningKeyPair(),
  ]);
  const [ownerPrint, imposterPrint] = await Promise.all([
    publicKeyFingerprint(owner.publicKey),
    publicKeyFingerprint(imposter.publicKey),
  ]);
  const signature = await signText(START_MESSAGE, owner.privateKey);
  return { owner, imposter, ownerPrint, imposterPrint, signature };
}

export function SignDemo() {
  const [owner, setOwner] = useState<CryptoKeyPair | null>(null);
  const [imposter, setImposter] = useState<CryptoKeyPair | null>(null);
  const [ownerPrint, setOwnerPrint] = useState("");
  const [imposterPrint, setImposterPrint] = useState("");

  const [message, setMessage] = useState(START_MESSAGE);
  const [signedMessage, setSignedMessage] = useState("");
  const [signature, setSignature] = useState("");

  const [verifyWith, setVerifyWith] = useState<VerifyWith>("owner");
  const [valid, setValid] = useState<boolean | null>(null);

  // Push a fresh set of identities into state.
  const applyFresh = (f: Identities) => {
    setOwner(f.owner);
    setImposter(f.imposter);
    setOwnerPrint(f.ownerPrint);
    setImposterPrint(f.imposterPrint);
    setSignature(f.signature);
    setSignedMessage(START_MESSAGE);
    setMessage(START_MESSAGE);
    setVerifyWith("owner");
  };

  // Generate the first pair of identities on mount, then sign the opener.
  useEffect(() => {
    let alive = true;
    (async () => {
      const f = await freshIdentities();
      if (!alive) return;
      setOwner(f.owner);
      setImposter(f.imposter);
      setOwnerPrint(f.ownerPrint);
      setImposterPrint(f.imposterPrint);
      setSignature(f.signature);
      setSignedMessage(START_MESSAGE);
      setMessage(START_MESSAGE);
      setVerifyWith("owner");
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Re-verify live whenever the message, signature, or chosen key changes.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!owner || !imposter || !signature) return;
      const pub =
        verifyWith === "owner" ? owner.publicKey : imposter.publicKey;
      const ok = await verifyText(message, signature, pub);
      if (alive) setValid(ok);
    })();
    return () => {
      alive = false;
    };
  }, [message, signature, verifyWith, owner, imposter]);

  const sign = async () => {
    if (!owner) return;
    const sig = await signText(message, owner.privateKey);
    setSignature(sig);
    setSignedMessage(message);
    setVerifyWith("owner");
  };

  const edited = message !== signedMessage;

  return (
    <div className="rounded-xl border border-sign/30 bg-card/50 p-5 sm:p-6">
      {/* identity strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sign">
          <PenLine className="size-4" />
          <span className="font-data text-[11px]">ECDSA P-256 key pair</span>
        </div>
        <button
          type="button"
          onClick={async () => applyFresh(await freshIdentities())}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-data text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3" />
          new keys
        </button>
      </div>

      <div className="mt-2 rounded-lg border border-border bg-background/50 px-3.5 py-2.5">
        <span className="label-spec">your public key · fingerprint</span>
        <p className="mt-1 font-data text-[12px] break-all text-sign">
          {ownerPrint || "…"}
        </p>
      </div>

      {/* message */}
      <div className="mt-5 flex flex-col gap-2">
        <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
          message
        </label>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="font-data"
        />
      </div>

      <button
        type="button"
        onClick={sign}
        disabled={!edited}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-data text-[12px] transition-colors",
          edited
            ? "border-sign/40 bg-sign-soft text-sign hover:bg-sign/20"
            : "border-border text-muted-foreground/60",
        )}
      >
        <PenLine className="size-3.5" />
        {edited ? "Sign this message" : "Signed"}
      </button>

      {/* signature */}
      <div className="mt-4 rounded-lg border border-border bg-background/50 p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-spec">signature</span>
          {signature && <CopyButton value={signature} />}
        </div>
        <p className="font-data text-[12px] leading-relaxed break-all text-sign">
          {signature || "—"}
        </p>
      </div>

      {/* verify-with toggle */}
      <div className="mt-5">
        <span className="label-spec">verify with</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <KeyChoice
            active={verifyWith === "owner"}
            onClick={() => setVerifyWith("owner")}
            icon={<UserRound className="size-3.5" />}
            label="the signer's key"
            print={ownerPrint}
          />
          <KeyChoice
            active={verifyWith === "imposter"}
            onClick={() => setVerifyWith("imposter")}
            icon={<UsersRound className="size-3.5" />}
            label="someone else's key"
            print={imposterPrint}
          />
        </div>
      </div>

      {/* verdict */}
      <div
        className={cn(
          "mt-4 flex items-start gap-3 rounded-lg border p-4",
          valid
            ? "border-sign/40 bg-sign-soft"
            : "border-destructive/40 bg-destructive/5",
        )}
      >
        {valid ? (
          <>
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-sign" />
            <div>
              <p className="font-display text-lg leading-none text-sign">
                Signature valid
              </p>
              <p className="mt-2 text-sm text-foreground/80">
                This message was signed by the holder of that exact private key,
                and hasn&apos;t changed since.
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-display text-lg leading-none text-destructive">
                Signature rejected
              </p>
              <p className="mt-2 text-sm text-destructive/90">
                {verifyWith === "imposter"
                  ? "Right message, wrong key — only the signer's matching public key accepts it."
                  : "The message changed after signing, so the signature no longer matches its contents."}
              </p>
            </div>
          </>
        )}
      </div>

      <p className="mt-3 font-data text-[11px] text-muted-foreground">
        {edited
          ? "You edited the message after signing. Re-sign, or watch the check fail."
          : verifyWith === "imposter"
            ? "Same signed message — but checked against the wrong public key."
            : "Edit one character of the message, or switch to someone else's key, to break it."}
      </p>
    </div>
  );
}

function KeyChoice({
  active,
  onClick,
  icon,
  label,
  print,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  print: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-sign/50 bg-sign-soft"
          : "border-border hover:border-border/80 hover:bg-background/40",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 font-data text-[11px]",
          active ? "text-sign" : "text-muted-foreground",
        )}
      >
        {icon}
        {label}
      </span>
      <span className="font-data text-[10px] break-all text-muted-foreground/70">
        {print ? print.slice(0, 14) + "…" : "…"}
      </span>
    </button>
  );
}
