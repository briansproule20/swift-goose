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
import { Base64Math } from "@/components/base64-math";
import { Base64Decoder } from "@/components/base64-decoder";

export const metadata: Metadata = {
  title: "Encoding · Base64 — Saltworks",
  description:
    "Base64 rewrites bytes using 64 safe characters. What it's for, the bit math behind it, and why it isn't security.",
};

export default function EncodingPage() {
  return (
    <article>
      <LessonHeader conceptId="encode" />

      <LessonBody>
        <Section title="What it does">
          <p>
            Base64 takes arbitrary bytes and rewrites them using 64 characters
            that are safe to put almost anywhere: <Mono>A–Z</Mono>,{" "}
            <Mono>a–z</Mono>, <Mono>0–9</Mono>, <Mono>+</Mono>, and{" "}
            <Mono>/</Mono>. Every 3 bytes in become 4 of those characters out.
            No key, nothing hidden — it&apos;s a reversible translation, and
            anyone can run it backward.
          </p>
        </Section>

        <Section title="Why it exists">
          <p>
            Plenty of systems were built for text, not raw binary. Email
            headers, URLs, JSON — they choke on control characters, newlines,
            anything non-printable. Base64 launders those bytes into characters
            that survive the trip: embedding an image in a data URL, attaching a
            file to an email, stuffing a token into a URL.
          </p>
          <p>
            The cost is size. Three bytes become four characters, so output
            grows by about <strong>33%</strong>. The trailing <Mono>=</Mono>{" "}
            signs are padding, added so the length lands on a multiple of four.
          </p>
        </Section>

        <Section title="The bit math">
          <p>
            Here&apos;s the whole trick on three bytes. The same 24 bits get
            sliced into bytes one way and into base64 groups another — the
            boundaries don&apos;t line up, and that&apos;s the point.
          </p>
          <Base64Math word="Sun" />
        </Section>

        <Section title="Run it">
          <p>
            Type something and watch it encode, then decode straight back with
            no key. Accented characters take more than one byte, so the counts
            drift apart.
          </p>
          <EncodeDemo />
        </Section>

        <Callout tone="trap" title="It looks encrypted. It isn't.">
          <p>
            This is the common mistake. Base64 output looks scrambled, so people
            assume it&apos;s protected. There&apos;s no key and no secret —{" "}
            <Mono>atob()</Mono> reverses it in one step. Base64 a password and
            ship it, and you&apos;ve shipped the password. For secrecy you want{" "}
            <a
              href="/learn/encryption"
              className="text-encrypt underline-offset-4 hover:underline"
            >
              encryption
            </a>
            .
          </p>
        </Callout>

        <Section title="Decode anything">
          <p>
            Paste any Base64 string and read it back. No key required — proof of
            the point above.
          </p>
          <Base64Decoder />
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="encode" />
    </article>
  );
}
