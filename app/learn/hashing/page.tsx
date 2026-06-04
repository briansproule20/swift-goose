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
import { ModHashMath } from "@/components/mod-hash-math";

export const metadata: Metadata = {
  title: "Hashing · SHA-256 — Saltworks",
  description:
    "Why SHA-256 is a one-way fingerprint you can't reverse: information thrown away, no algebraic inverse, and a 2^256 search space. Plus the avalanche effect, live.",
};

export default function HashingPage() {
  return (
    <article>
      <LessonHeader conceptId="hash" />

      <LessonBody>
        <Section title="What it does">
          <p>
            A hash takes any input — one character or a terabyte — and returns a
            fixed-size fingerprint. SHA-256 always gives back 256 bits, written
            as 64 hex characters. Same input, same fingerprint, every time. Any
            difference at all, a completely different fingerprint.
          </p>
          <p>
            And it only goes one way. There is no un-hash. Given a fingerprint
            you can&apos;t compute the input it came from — you can only guess
            inputs and check. The rest of this page is about <em>why</em> that&apos;s
            true, not just asserted.
          </p>
        </Section>

        <Section title="Why you can't reverse it — 1: it throws information away">
          <p>
            The input space is unlimited. There are infinitely many possible
            messages. The output space is fixed: exactly 2<sup>256</sup>{" "}
            fingerprints. You can&apos;t map infinitely many things onto finitely
            many things without sending huge numbers of inputs to the same
            output. That&apos;s the pigeonhole principle, and it guarantees{" "}
            <strong>collisions must exist</strong>.
          </p>
          <p>
            So a fingerprint genuinely doesn&apos;t identify one input. The
            information that told two messages apart isn&apos;t encrypted —
            it&apos;s simply gone. Here&apos;s the same collapse at toy scale,{" "}
            <Mono>h(n) = n mod 12</Mono>:
          </p>
          <ModHashMath />
        </Section>

        <Section title="Why you can't reverse it — 2: it scrambles past algebra">
          <p>
            Collapsing the space isn&apos;t enough on its own — <Mono>mod 12</Mono>{" "}
            still leaks structure (you learn the input&apos;s remainder). SHA-256
            also <em>mixes</em>. It runs 64 rounds of additions, bit-rotations,
            XORs, and bitwise choose/majority functions, folding every input bit
            into the entire 256-bit state over and over.
          </p>
          <p>
            The result has no usable algebraic structure to invert. You
            can&apos;t isolate the input and &ldquo;solve for it,&rdquo; because
            each output bit depends on all the input bits through a tangle of
            non-linear steps. This is what the{" "}
            <strong>avalanche effect</strong> looks like from the outside — flip
            one input bit and about half the output bits flip, unpredictably:
          </p>
          <AvalancheDemo />
        </Section>

        <Section title="Why you can't reverse it — 3: no shortcut, and the space is absurd">
          <p>
            Because there&apos;s no inverse and no structure to exploit, the only
            way back is to guess inputs and hash them until one matches — finding
            a <em>preimage</em>. That means searching a space of 2
            <sup>256</sup> ≈ 1.16 × 10<sup>77</sup> values. For scale,
            that&apos;s within a few orders of magnitude of the number of atoms
            in the observable universe.
          </p>
          <p>
            Put a machine on it doing a trillion hashes a second, then a billion
            of those machines. Run them since the Big Bang. You&apos;d cover such
            a vanishing sliver of 2<sup>256</sup> that the entire age of the
            universe rounds to zero progress. &ldquo;Irreversible&rdquo; here
            isn&apos;t a slogan — it&apos;s an arithmetic wall.
          </p>
        </Section>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>Passwords</strong> — a site stores the hash, never the
              password, with a per-user <em>salt</em> mixed in so identical
              passwords don&apos;t share a fingerprint.
            </li>
            <li>
              <strong>File integrity</strong> — a published checksum lets you
              confirm a download arrived byte-for-byte intact.
            </li>
            <li>
              <strong>Signatures &amp; blockchains</strong> — you sign the hash
              of a document, and any later edit changes the hash, so tampering is
              obvious.
            </li>
          </ul>
        </Section>

        <Callout title="A hash isn't locked — it's destroyed on purpose">
          <p>
            Encryption hides data behind a key you can later use to get it back.
            A hash keeps nothing back to recover. There&apos;s no key and no
            return path by design. The moment you need the original data again,
            you wanted{" "}
            <a
              href="/learn/encryption"
              className="text-encrypt underline-offset-4 hover:underline"
            >
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
