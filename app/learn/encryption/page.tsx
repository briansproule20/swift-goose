import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { EncryptDemo } from "@/components/encrypt-demo";
import { XorMath } from "@/components/xor-math";

export const metadata: Metadata = {
  title: "Encryption · AES-GCM — Saltworks",
  description:
    "AES-GCM scrambles data so only the right key gets it back. Symmetric vs. asymmetric, the XOR math at the core, and why a wrong key fails by design.",
};

export default function EncryptionPage() {
  return (
    <article>
      <LessonHeader conceptId="encrypt" />

      <LessonBody>
        <Section title="What it does">
          <p>
            Encryption scrambles data so only someone with the right key can put
            it back. Unlike hashing, it&apos;s fully reversible — that&apos;s the
            point. Unlike encoding, the reversal is gated: without the key, the
            ciphertext is useless.
          </p>
          <p>
            <Mono>AES-GCM</Mono> is the modern default. The <strong>AES</strong>{" "}
            part does the scrambling; the <strong>GCM</strong> part adds an
            authentication tag — a tamper check that makes a wrong key, or
            altered ciphertext, fail loudly instead of quietly returning
            nonsense.
          </p>
        </Section>

        <Section title="The math at the core: XOR">
          <p>
            AES is elaborate, but the move it&apos;s built on is simple. Combine
            each bit of your data with a bit of the key using XOR. XOR has one
            magic property: do it twice with the same value and you&apos;re back
            where you started. So the same key both locks and unlocks — and a
            wrong key just gives you junk.
          </p>
          <XorMath />
        </Section>

        <Section title="Symmetric vs. asymmetric">
          <p>
            Two families. <strong>Symmetric</strong> (like AES) uses the same key
            to lock and unlock — fast, good for data at rest and bulk traffic.{" "}
            <strong>Asymmetric</strong> uses a pair: a public key to lock, a
            private key to unlock, which solves &ldquo;how do two strangers agree
            on a key over an open line?&rdquo;
          </p>
          <p>
            In practice they team up. HTTPS uses asymmetric encryption to swap a
            symmetric key, then switches to fast symmetric encryption for the
            rest of the conversation. The demo below is symmetric.
          </p>
        </Section>

        <Section title="Lock it, then try the wrong key">
          <p>
            Encrypt with one key, then try to decrypt with another. Change the
            unlock key by a single character. The failure isn&apos;t a bug —
            it&apos;s the guarantee.
          </p>
          <EncryptDemo />
        </Section>

        <Callout title="Why the failure is the feature">
          <p>
            A wrong key doesn&apos;t hand back a slightly-wrong message or
            readable nonsense — GCM checks an authentication tag and rejects the
            attempt outright. That&apos;s what lets you trust decrypted data is
            both secret and unaltered. Notice too that encrypting the same
            message twice gives different ciphertext, thanks to a fresh random IV
            each time — so an observer can&apos;t even tell when you repeat
            yourself.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>HTTPS</strong> — every site you visit encrypts traffic in
              transit.
            </li>
            <li>
              <strong>Messaging</strong> — end-to-end encryption keeps even the
              provider from reading along.
            </li>
            <li>
              <strong>Files at rest</strong> — disk and database encryption
              protect data if a device is lost or stolen.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="encrypt" />
    </article>
  );
}
