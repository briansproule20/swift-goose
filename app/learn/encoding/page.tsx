import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { EncodeDemo } from "@/components/encode-demo";

export const metadata: Metadata = {
  title: "Encoding (Base64) — Cipher Lab",
  description:
    "Base64 is translation into a safe alphabet, not a secret. Learn what encoding is for, why it exists, and why it provides zero security.",
};

export default function EncodingLesson() {
  return (
    <article>
      <LessonHeader conceptId="encode" />

      <LessonBody>
        <Section title="What it actually does">
          <p>
            Base64 takes arbitrary bytes and rewrites them using just 64 “safe”
            characters — <Mono>A–Z</Mono>, <Mono>a–z</Mono>, <Mono>0–9</Mono>,
            plus <Mono>+</Mono> and <Mono>/</Mono>. Every 3 bytes of input become
            4 of these characters. That&apos;s the entire trick: it&apos;s a
            faithful, reversible <em>translation</em>, not a transformation of
            meaning.
          </p>
          <p>
            Crucially, no key is involved and nothing is hidden. Anyone who sees
            Base64 can turn it straight back into the original — and so can you,
            below.
          </p>
        </Section>

        <Section title="Why it exists">
          <p>
            Lots of systems were built for text, not raw binary. Email headers,
            URLs, JSON, and HTML attributes all choke on certain bytes — control
            characters, newlines, anything non-printable. Base64 launders those
            bytes into characters that survive the trip intact: think of
            embedding an image in a data URL, or attaching a file to an email.
          </p>
          <p>
            The cost is size. Because 3 bytes become 4 characters, output grows
            by roughly <strong>33%</strong>. The trailing <Mono>=</Mono> signs
            you sometimes see are padding, added so the length lands on a
            multiple of four.
          </p>
        </Section>

        <Section title="See it round-trip">
          <p>
            Type below — including emoji or accented characters. Watch it encode,
            then decode straight back with no key. Notice the byte count, the
            character count, and the padding.
          </p>
          <EncodeDemo />
        </Section>

        <Callout tone="trap" title="The trap: Base64 looks encrypted">
          <p>
            This is the single most common security mistake. Base64 output{" "}
            <em>looks</em> scrambled, so people assume it&apos;s protected. It is
            not. There is no key, no secret, and no work involved in reversing
            it — <Mono>atob()</Mono> does it in one step. If you Base64 a password
            and ship it, you have shipped the password.
          </p>
          <p className="mt-2">
            Encoding answers “how do I move this safely?”, never “how do I keep
            this secret?” For secrecy you need{" "}
            <a href="/learn/encryption" className="text-encrypt underline-offset-4 hover:underline">
              encryption
            </a>
            .
          </p>
        </Callout>
      </LessonBody>

      <LessonFooterNav conceptId="encode" />
    </article>
  );
}
