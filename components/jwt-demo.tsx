"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BadgeCheck, Eye, RotateCcw, ShieldX, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { generateSigningKeyPair } from "@/lib/sign";
import { JWT_HEADER, encodeSegment, signClaims, verifyJwt } from "@/lib/jwt";
import { cn } from "@/lib/utils";

const ISSUED_ROLE = "user";

export function JwtDemo() {
  const [keys, setKeys] = useState<CryptoKeyPair | null>(null);
  const [role, setRole] = useState(ISSUED_ROLE);
  const [signature, setSignature] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);

  const payload = useMemo(
    () => ({ sub: "1011", name: "Ada Lovelace", role, iat: 1700000000 }),
    [role],
  );
  const headerSeg = useMemo(() => encodeSegment(JWT_HEADER), []);
  const payloadSeg = useMemo(() => encodeSegment(payload), [payload]);
  const token = signature
    ? `${headerSeg}.${payloadSeg}.${signature}`
    : "";

  // Issue the token on mount: sign the original claims (role = "user").
  useEffect(() => {
    let alive = true;
    (async () => {
      const kp = await generateSigningKeyPair();
      const issuedPayload = {
        sub: "1011",
        name: "Ada Lovelace",
        role: ISSUED_ROLE,
        iat: 1700000000,
      };
      const sig = await signClaims(issuedPayload, kp.privateKey);
      if (!alive) return;
      setKeys(kp);
      setSignature(sig);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Re-verify the current token live.
  useEffect(() => {
    if (!keys || !token) return;
    let alive = true;
    (async () => {
      const ok = await verifyJwt(token, keys.publicKey);
      if (alive) setValid(ok);
    })();
    return () => {
      alive = false;
    };
  }, [token, keys]);

  const tampered = role !== ISSUED_ROLE;

  return (
    <div className="rounded-xl border border-jwt/30 bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-jwt">
          <Ticket className="size-4" />
          <span className="font-data text-[11px]">
            JWS · ES256 — issued and signed by the server
          </span>
        </div>
        {token && <CopyButton value={token} />}
      </div>

      {/* the token, three colored segments */}
      <div className="mt-3 rounded-lg border border-border bg-background/50 p-3.5">
        <p className="font-data text-[12px] leading-relaxed break-all">
          <span className="text-encode">{headerSeg}</span>
          <span className="text-muted-foreground/50">.</span>
          <span className="text-encode/90">{payloadSeg}</span>
          <span className="text-muted-foreground/50">.</span>
          <span className="text-jwt">{signature || "…"}</span>
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-data text-[10px] text-muted-foreground">
          <span>
            <span className="text-encode">●</span> header
          </span>
          <span>
            <span className="text-encode/90">●</span> payload
          </span>
          <span>
            <span className="text-jwt">●</span> signature
          </span>
        </p>
      </div>

      {/* anyone can read it */}
      <div className="mt-3 rounded-lg border border-encode/30 bg-encode-soft p-4">
        <div className="flex items-center gap-2 text-encode">
          <Eye className="size-4" />
          <span className="font-data text-[11px]">
            decoded — no key required, it&apos;s only Base64
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Decoded label="header" json={JSON.stringify(JWT_HEADER, null, 2)} />
          <Decoded label="payload" json={JSON.stringify(payload, null, 2)} />
        </div>
      </div>

      {/* tamper with a claim */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
            edit the payload&apos;s “role” claim
          </label>
          {tampered && (
            <button
              type="button"
              onClick={() => setRole(ISSUED_ROLE)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-data text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              restore issued token
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="font-data"
          />
          <button
            type="button"
            onClick={() => setRole("admin")}
            className="shrink-0 rounded-md border border-border px-2.5 py-1.5 font-data text-[11px] text-muted-foreground transition-colors hover:border-jwt/50 hover:text-jwt"
          >
            try “admin”
          </button>
        </div>
      </div>

      {/* verdict */}
      <div
        className={cn(
          "mt-4 flex items-start gap-3 rounded-lg border p-4",
          valid
            ? "border-jwt/40 bg-jwt-soft"
            : "border-destructive/40 bg-destructive/5",
        )}
      >
        {valid ? (
          <>
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-jwt" />
            <div>
              <p className="font-display text-lg leading-none text-jwt">
                Token accepted
              </p>
              <p className="mt-2 text-sm text-foreground/80">
                The signature matches the header and payload exactly — the server
                trusts these claims without looking anything up.
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-display text-lg leading-none text-destructive">
                Token rejected
              </p>
              <motion.p
                key={role}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-destructive/90"
              >
                You changed a claim, so the payload bytes no longer match the
                signature. Only the server&apos;s private key could mint a
                signature for <span className="font-data">role: {role}</span> —
                and you don&apos;t have it.
              </motion.p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Decoded({ label, json }: { label: string; json: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <span className="label-spec">{label}</span>
      <pre className="mt-1.5 overflow-x-auto font-data text-[11px] leading-relaxed text-foreground/85">
        {json}
      </pre>
    </div>
  );
}
