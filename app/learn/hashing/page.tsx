import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { AvalancheDemo } from "@/components/avalanche-demo";

export const metadata: Metadata = {
  title: "Hashing (SHA-256) — Cipher Lab",
  description:
    "SHA-256 is a one-way fingerprint: deterministic, fixed-length, irreversible. Learn the avalanche effect and what hashing is actually for.",
};

export default function HashingLesson() {
  return (
    <article>
      <LessonHeader conceptId="hash" />

      <LessonBody>
        <Section title="What it actually does">
          <p>
            A hash function takes any input — one character or a gigabyte — and
            produces a fixed-size fingerprint. SHA-256 always returns 256 bits,
            written as 64 hex characters. The same input always yields the same
            fingerprint; the tiniest difference yields a completely different
            one.
          </p>
          <p>
            And it only goes one way. There is no “un-hash” function. Given a
            fingerprint, you cannot compute the input it came from — you can only
            guess inputs and check whether they match.
          </p>
        </Section>

        <Section title="The four properties that matter">
          <ul className="space-y-2">
            <li>
              <strong className="text-hash">Deterministic</strong> — same input,
              same output, every time. That&apos;s what makes it useful for
              comparison.
            </li>
            <li>
              <strong className="text-hash">Fixed-length</strong> — 256 bits in,
              256 bits out, regardless of input size.
            </li>
            <li>
              <strong className="text-hash">Irreversible</strong> — many inputs
              map to the space of outputs (the pigeonhole principle), and there&apos;s
              no mathematical shortcut backward.
            </li>
            <li>
              <strong className="text-hash">Avalanche</strong> — flip one input
              bit and about half the output bits flip, unpredictably.
            </li>
          </ul>
        </Section>

        <Section title="Feel the avalanche">
          <p>
            This is the property that makes hashing trustworthy. Edit the text
            below — change a single character — and watch how much of the
            fingerprint changes. There&apos;s no gradual drift: a one-character
            edit scatters roughly half the bits.
          </p>
          <AvalancheDemo />
        </Section>

        <Section title="What it's for">
          <p>
            Because the fingerprint changes completely on any edit, hashing is
            how systems <strong>verify</strong> things without storing them in
            the clear:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Passwords</strong> — sites store the hash, not your
              password (with a per-user <em>salt</em>, so identical passwords
              don&apos;t share a fingerprint).
            </li>
            <li>
              <strong>File integrity</strong> — download checksums let you
              confirm a file arrived byte-for-byte intact.
            </li>
            <li>
              <strong>Digital signatures &amp; blockchains</strong> — sign the
              hash of a document, and any later tampering is instantly visible.
            </li>
          </ul>
        </Section>

        <Callout title="Hashing ≠ encryption">
          <p>
            A hash isn&apos;t “locked” — it&apos;s <em>destroyed</em> on purpose.
            You can&apos;t get the input back even with a key, because there is no
            key and no path back. If you ever need the original data again, you
            wanted{" "}
            <a href="/learn/encryption" className="text-encrypt underline-offset-4 hover:underline">
              encryption
            </a>
            , not <Mono>SHA-256</Mono>.
          </p>
        </Callout>
      </LessonBody>

      <LessonFooterNav conceptId="hash" />
    </article>
  );
}
