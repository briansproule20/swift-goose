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
            <Mono>AES-GCM</Mono> is the modern default, and the name is two
            pieces. <strong>AES</strong> — the Advanced Encryption Standard —
            does the actual scrambling. <strong>GCM</strong> — Galois/Counter
            Mode — wraps it with an authentication tag, a short check value that
            makes a wrong key or altered ciphertext fail loudly instead of
            quietly returning nonsense. We&apos;ll unpack both below.
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
            But XOR against a single fixed key is a toy: reuse the key and
            patterns leak straight through. AES&apos;s real job is to manufacture
            a flood of unpredictable, key-dependent material to XOR against — and
            to scramble the bits so thoroughly in between that the output looks
            random while staying perfectly reversible.
          </p>
        </Section>

        <Section title="What AES actually is">
          <p>
            <strong>AES</strong> (the Advanced Encryption Standard) is a{" "}
            <em>block cipher</em>: it encrypts data in fixed-size chunks of 16
            bytes at a time, not letter by letter. You hand it one block plus a
            key — 128, 192, or 256 bits long — and it hands back a scrambled
            block the same size.
          </p>
          <p>
            The scrambling isn&apos;t a single step; it&apos;s a short recipe
            repeated many times. With a 256-bit key, AES runs 14{" "}
            <em>rounds</em>, and each round does three jobs:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Substitute.</strong> Every byte is swapped for another
              through a fixed lookup table called the <em>S-box</em> (substitution
              box). This breaks any simple relationship between key and output —
              what cryptographers call <em>confusion</em>.
            </li>
            <li>
              <strong>Mix.</strong> The bytes are shuffled and blended across the
              block, so touching one byte ripples into all the rest —{" "}
              <em>diffusion</em>.
            </li>
            <li>
              <strong>Add the key.</strong>{" "}
              A slice of key material for that round
              gets XOR&apos;d in — the same XOR from above.
            </li>
          </ul>
          <p>
            Confusion and diffusion (named by Claude Shannon in 1945) are the
            whole game. Confusion hides the key; diffusion spreads your data so
            thoroughly that flipping one input bit changes the entire block
            unpredictably — the same avalanche idea you met in hashing. After 14
            passes there&apos;s no thread left to pull without the key.
          </p>
          <p>
            One catch: that only encrypts a single 16-byte block. To cover a whole
            message you need a <em>mode of operation</em>{" "}
            that chains blocks
            together — and that&apos;s the <strong>GCM</strong> in AES-GCM
            (Galois/Counter Mode). It turns the block cipher into a stream so any
            length works, and computes the authentication tag that catches
            tampering or a wrong key.
          </p>
        </Section>

        <Section title="Why AES is the standard">
          <p>
            In 1997 the US National Institute of Standards and Technology (NIST)
            ran a public, international contest to replace the aging DES (the Data
            Encryption Standard, the 1970s cipher then in use). Fifteen designs
            were submitted and attacked in the open by cryptographers worldwide. A
            Belgian design, <strong>Rijndael</strong>, won in 2001 and became AES.
            That openness is the point: nothing about it is secret, so there&apos;s
            nowhere to hide a backdoor.
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
            <strong>Asymmetric</strong>{" "}
            uses a pair: a public key to lock, a
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
            (initialization vector — a unique starter value) each time, so an
            observer can&apos;t even tell when you repeat yourself.
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
