/**
 * CERTIFICATES & THE CHAIN OF TRUST — how signatures scale to the whole web
 *
 * A signature proves a message came from the holder of a particular key. But
 * how do you know that key belongs to "saltworks.dev" and not an impostor? You
 * can't have met every server in person. The answer is delegation:
 *
 *   · A handful of root Certificate Authorities are trusted by default — their
 *     keys ship inside your browser and operating system.
 *   · A root signs an intermediate CA's certificate. ("I vouch for them.")
 *   · The intermediate signs the server's certificate. ("And I vouch for them.")
 *
 * Each certificate is just a signed statement — "this name owns this public
 * key" — and verifying a site means walking the chain of signatures up to a
 * root you already trust. Break any link, or fail to reach a trusted root, and
 * the whole thing is rejected.
 *
 * Every signature below is a real ECDSA signature, computed in your browser.
 */

import {
  generateSigningKeyPair,
  publicKeyFingerprint,
  publicKeyHex,
  signText,
  verifyText,
} from "./sign";

interface Cert {
  subject: string;
  issuer: string;
  publicKey: CryptoKey; // the subject's key — used to verify whatever it signs
  publicKeyHex: string;
  signature: string; // over this cert's tbs, made by the ISSUER's private key
  isRoot: boolean;
}

/** The bytes a certificate's signature actually covers. */
function tbs(c: Pick<Cert, "subject" | "issuer" | "publicKeyHex">): string {
  return `${c.subject}|${c.issuer}|${c.publicKeyHex}`;
}

export type Flaw = "none" | "leaf-key" | "intermediate-sig" | "untrusted-root";

export interface CertView {
  subject: string;
  issuer: string;
  role: "leaf" | "intermediate" | "root";
  publicKeyHex: string; // truncated
  signatureHex: string; // truncated
  ok: boolean;
  detail: string;
}

export interface Scenario {
  ok: boolean;
  certs: CertView[]; // ordered leaf → intermediate → root
}

const ROOT = "Saltworks Root CA";
const INTERMEDIATE = "Saltworks Intermediate CA";
const LEAF = "saltworks.dev";

function shorten(s: string, n = 20): string {
  return s.slice(0, n).replace(/(.{4})/g, "$1 ").trim() + " …";
}

/**
 * Build a three-link chain, optionally injecting one flaw, then verify it the
 * way a browser would: walk from the leaf up, checking each signature against
 * the issuer above it, and confirm the chain ends at a trusted root.
 */
export async function buildScenario(flaw: Flaw = "none"): Promise<Scenario> {
  const [rootKp, midKp, leafKp, attackerKp] = await Promise.all([
    generateSigningKeyPair(),
    generateSigningKeyPair(),
    generateSigningKeyPair(),
    generateSigningKeyPair(),
  ]);

  const rootPkHex = await publicKeyHex(rootKp.publicKey);
  const midPkHex = await publicKeyHex(midKp.publicKey);
  let leafPkHex = await publicKeyHex(leafKp.publicKey);
  let leafPublicKey = leafKp.publicKey;

  // The flaw "leaf-key": an attacker swaps in their own public key but can't
  // re-sign for it, so the issuer's signature now covers the *old* key.
  if (flaw === "leaf-key") {
    leafPkHex = await publicKeyHex(attackerKp.publicKey);
    leafPublicKey = attackerKp.publicKey;
  }

  const root: Cert = {
    subject: ROOT,
    issuer: ROOT,
    publicKey: rootKp.publicKey,
    publicKeyHex: rootPkHex,
    signature: await signText(
      tbs({ subject: ROOT, issuer: ROOT, publicKeyHex: rootPkHex }),
      rootKp.privateKey, // self-signed
    ),
    isRoot: true,
  };

  const intermediate: Cert = {
    subject: INTERMEDIATE,
    issuer: ROOT,
    publicKey: midKp.publicKey,
    publicKeyHex: midPkHex,
    signature: await signText(
      tbs({ subject: INTERMEDIATE, issuer: ROOT, publicKeyHex: midPkHex }),
      rootKp.privateKey, // signed by the root
    ),
    isRoot: false,
  };
  if (flaw === "intermediate-sig") {
    // Corrupt one character of the intermediate's signature.
    const s = intermediate.signature;
    const i = 8 % s.length;
    const swap = s[i] === "A" ? "B" : "A";
    intermediate.signature = s.slice(0, i) + swap + s.slice(i + 1);
  }

  const leaf: Cert = {
    subject: LEAF,
    issuer: INTERMEDIATE,
    publicKey: leafPublicKey,
    publicKeyHex: leafPkHex,
    // Always signed over the *original* leaf key; under "leaf-key" the displayed
    // key no longer matches what was signed.
    signature: await signText(
      tbs({
        subject: LEAF,
        issuer: INTERMEDIATE,
        publicKeyHex: await publicKeyHex(leafKp.publicKey),
      }),
      midKp.privateKey, // signed by the intermediate
    ),
    isRoot: false,
  };

  // The browser's trust store. Under "untrusted-root" the root simply isn't in
  // it — every signature still checks out, but trust has nowhere to anchor.
  const rootFingerprint = await publicKeyFingerprint(rootKp.publicKey);
  const trusted = new Set<string>(
    flaw === "untrusted-root" ? [] : [rootFingerprint],
  );

  // ── Verify, leaf → root ──
  const chain = [leaf, intermediate, root];
  const issuers = [intermediate, root, root]; // who signed each cert above

  const views: CertView[] = [];
  for (let i = 0; i < chain.length; i++) {
    const c = chain[i];
    const issuerKey = issuers[i].publicKey;
    const sigOk = await verifyText(tbs(c), c.signature, issuerKey);

    let ok = sigOk;
    let detail: string;
    const role = c.isRoot ? "root" : i === 0 ? "leaf" : "intermediate";

    if (c.isRoot) {
      const fp = await publicKeyFingerprint(c.publicKey);
      const trustedOk = trusted.has(fp);
      ok = sigOk && trustedOk;
      detail = !sigOk
        ? "Self-signature invalid."
        : trustedOk
          ? "Self-signed — trusted because this root ships in your browser."
          : "Self-signed, but this root isn't in the trust store. Anyone can mint one of these.";
    } else if (!sigOk) {
      detail =
        role === "leaf" && flaw === "leaf-key"
          ? "The signature covers a different public key than the one presented."
          : `Signature doesn't verify against ${c.issuer}'s key.`;
    } else {
      detail = `Signed by ${c.issuer} ✓`;
    }

    views.push({
      subject: c.subject,
      issuer: c.issuer,
      role,
      publicKeyHex: shorten(c.publicKeyHex),
      signatureHex: shorten(c.signature, 24),
      ok,
      detail,
    });
  }

  return { ok: views.every((v) => v.ok), certs: views };
}
