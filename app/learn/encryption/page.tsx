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

export const metadata: Metadata = {
  title: "Encryption (AES-GCM) — Cipher Lab",
  description:
    "AES-GCM is two-way scrambling that needs the right key to undo. Learn symmetric vs. asymmetric, and why the wrong key fails by design.",
};

export default function EncryptionLesson() {
  return (
    <article>
      <LessonHeader conceptId="encrypt" />

      <LessonBody>
        <Section title="What it actually does">
          <p>
            Encryption scrambles data so that only someone with the right key can
            unscramble it. Unlike hashing, it&apos;s fully reversible — that&apos;s
            the point. But unlike encoding, the reversal is gated: without the
            key, the ciphertext is useless.
          </p>
          <p>
            <Mono>AES-GCM</Mono> is the modern default. The <strong>AES</strong>{" "}
            part does the scrambling; the <strong>GCM</strong> part adds
            authentication — a built-in tamper check that makes a wrong key (or
            altered ciphertext) fail loudly instead of silently returning
            garbage.
          </p>
        </Section>

        <Section title="Symmetric vs. asymmetric">
          <p>
            There are two families. <strong>Symmetric</strong> encryption (like
            AES) uses the <em>same</em> key to lock and unlock — fast, ideal for
            data at rest and bulk traffic. <strong>Asymmetric</strong> encryption
            uses a <em>pair</em>: a public key to lock and a private key to
            unlock, which solves the “how do we agree on a key over an insecure
            channel?” problem.
          </p>
          <p>
            In practice they team up: HTTPS uses asymmetric encryption to
            exchange a symmetric key, then switches to fast symmetric encryption
            for the rest of the conversation. The demo below is symmetric.
          </p>
        </Section>

        <Section title="Lock it, then try the wrong key">
          <p>
            Encrypt a message with one key, then attempt to decrypt it with
            another. Change the unlock key by a single character and watch what
            happens. The failure isn&apos;t a bug — it&apos;s the entire security
            guarantee.
          </p>
          <EncryptDemo />
        </Section>

        <Callout title="Why the failure is the feature">
          <p>
            A wrong key doesn&apos;t produce a slightly-wrong message or readable
            nonsense — GCM verifies an authentication tag and rejects the attempt
            outright. That&apos;s what lets you trust that decrypted data is both{" "}
            <em>secret</em> and <em>unaltered</em>. Notice too that encrypting the
            same message twice yields different ciphertext, thanks to a fresh
            random IV each time — so attackers can&apos;t even tell when you sent
            the same thing twice.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>HTTPS</strong> — every site you visit encrypts traffic in
              transit.
            </li>
            <li>
              <strong>Messaging</strong> — end-to-end encrypted chat keeps even
              the provider from reading along.
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
