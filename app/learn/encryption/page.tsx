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
import { CaesarDemo } from "@/components/caesar-demo";
import { EncryptionTimeline } from "@/components/encryption-timeline";

export const metadata: Metadata = {
  title: "Encryption · AES-GCM — Saltworks",
  description:
    "AES-GCM scrambles data so only the right key gets it back. A short history from Caesar to AES, the XOR at its core, why it's the standard, and the wrong-key failure.",
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

        <Section title="A short history">
          <p>
            Encryption is thousands of years older than computers. The whole
            history is a back-and-forth: someone invents a way to hide a message,
            someone else finds the pattern that gives it away.
          </p>
          <EncryptionTimeline />
          <p className="pt-2">
            Caesar&apos;s cipher is where it starts — shift every letter by a
            fixed amount. Try it:
          </p>
          <CaesarDemo />
        </Section>

        <Section title="The math at the core: XOR">
          <p>
            Skip ahead two millennia. Underneath modern encryption is one humble
            operation: <strong>XOR</strong> (exclusive or). It compares two bits
            and returns 1 only when they differ. Its magic property is that
            applying the same value twice cancels out —{" "}
            <Mono>p ⊕ k ⊕ k = p</Mono> — so the same key both scrambles and
            unscrambles.
          </p>
          <XorMath />
          <p>
            But XOR against a single fixed key is a toy: reuse it and patterns
            leak straight through. AES&apos;s real job is to manufacture a flood
            of unpredictable, key-dependent material to XOR against, and to
            scramble the bits so thoroughly in between that the result looks
            random while staying perfectly reversible.
          </p>
          <p>
            It works on 16-byte blocks. With a 256-bit key it runs 14 rounds, and
            each round does three things: push every byte through a fixed lookup
            table (the <em>S-box</em> — &ldquo;confusion&rdquo;), shuffle and mix
            the bytes across the block (&ldquo;diffusion&rdquo;), then XOR in a
            key derived for that round. Fourteen passes later, every output bit
            depends on every input bit and every key bit — and there&apos;s no way
            to unwind it without the key.
          </p>
        </Section>

        <Section title="Why AES is the standard">
          <p>
            In 1997 the US standards body, NIST, ran a public, international
            contest to replace the aging DES cipher. Fifteen designs were
            submitted and attacked in the open by cryptographers worldwide. A
            Belgian design, <strong>Rijndael</strong>, won in 2001 and became
            AES. That openness is the point: nothing about it is secret, so
            there&apos;s nowhere to hide a backdoor.
          </p>
          <p>
            It&apos;s also fast — and faster still in hardware, since modern CPUs
            run AES instructions natively. Your laptop encrypts at gigabytes a
            second, which is why it&apos;s everywhere: HTTPS, Wi-Fi, disk
            encryption, password managers, the demo on this page. Twenty-plus
            years of public attack later, there&apos;s still no practical break of
            full AES. &ldquo;Industry standard&rdquo; here means exactly that:
            open, fast, everywhere, and stubbornly unbroken.
          </p>
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
