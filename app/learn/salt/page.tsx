import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { KdfDemo } from "@/components/kdf-demo";

export const metadata: Metadata = {
  title: "Salt & Key Derivation · PBKDF2 — Saltworks",
  description:
    "How a weak human password becomes a strong key: salt to defeat precomputation, a deliberate work factor to defeat guessing, and a live PBKDF2 demo where one password yields two different keys.",
};

export default function SaltPage() {
  return (
    <article>
      <LessonHeader conceptId="salt" />

      <LessonBody>
        <Section title="What it does">
          <p>
            This site is named for the thing this page is about. A{" "}
            <strong>salt</strong>{" "}is a pinch of randomness mixed into a secret
            before it&apos;s hashed — and it&apos;s one half of how a short,
            guessable password becomes a real cryptographic key.
          </p>
          <p>
            The problem: a password like <Mono>swordfish</Mono> is short,
            low-entropy, and human. A key needs to be long, uniform, and
            unguessable. A <strong>key-derivation function</strong> (KDF) bridges
            the gap. <Mono>PBKDF2</Mono> — the one built into your browser — does
            it with two ideas: a salt, and a deliberately slow grind.
          </p>
        </Section>

        <Section title="Two problems salt solves">
          <p>
            Hashing a password without salt looks fine until you notice what
            determinism leaks:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Identical passwords collide.</strong> Hash{" "}
              <Mono>hunter2</Mono> and you always get the same digest — so two
              users who picked the same password store the same value, and a leak
              reveals that they match.
            </li>
            <li>
              <strong>One table cracks everyone.</strong> An attacker hashes the
              million most common passwords <em>once</em> into a{" "}
              <em>rainbow table</em>, then reverses any unsalted hash with a
              lookup. The work is done ahead of time, against all victims at
              once.
            </li>
          </ul>
          <p>
            A unique random salt per password kills both. The same password now
            hashes to a different value every time, so nothing collides — and a
            precomputed table is worthless, because the attacker would need a
            separate table for every possible salt, and there are <Mono>2¹²⁸</Mono>{" "}
            of them.
          </p>
        </Section>

        <Section title="Same password, different key">
          <p>
            Below, Alice and Bob type the <em>same</em> password — but each has
            their own salt, so each derives a completely different key. Edit the
            password (it applies to both) or roll a new salt and watch the keys
            stay stubbornly distinct:
          </p>
          <KdfDemo />
        </Section>

        <Section title="The work factor: slow on purpose">
          <p>
            Salt stops precomputation, but it doesn&apos;t stop someone guessing
            passwords one by one. That&apos;s the second idea: a KDF is{" "}
            <strong>deliberately slow</strong>. PBKDF2 repeats its inner hash tens
            of thousands of times — the demo above runs 100,000 rounds for a
            single derivation.
          </p>
          <p>
            The asymmetry is the whole point. You pay that cost{" "}
            <em>once</em>, when you log in, and never notice a few milliseconds.
            An attacker testing billions of guesses pays it{" "}
            <em>billions</em> of times, and the wall becomes impassable. As
            hardware speeds up, you simply raise the iteration count. Newer KDFs —{" "}
            <strong>Argon2</strong>, <strong>scrypt</strong>,{" "}
            <strong>bcrypt</strong> — go further and burn lots of{" "}
            <em>memory</em> too, which blunts the custom-chip attacks that make
            plain hashing cheap to brute-force.
          </p>
        </Section>

        <Callout title="Salt is not a secret">
          <p>
            A salt is stored right next to the hash, in the clear — it&apos;s not
            a key, and it doesn&apos;t need hiding. Its only job is to be{" "}
            <em>unique</em>, so each derivation stands alone. (A separate secret
            value mixed in and kept server-side is sometimes called a{" "}
            <em>pepper</em> — different tool, different page.)
          </p>
        </Callout>

        <Callout tone="trap" title="A fast hash is the wrong tool here">
          <p>
            SHA-256 is built to be <em>fast</em> — exactly what you want for
            integrity, and exactly what you <em>don&apos;t</em>{" "}want for
            passwords, where speed helps the attacker. Reaching for a plain hash
            to store passwords is the classic mistake. The fix is this page&apos;s
            slow, salted derivation — which is the foundation of{" "}
            <strong>password storage</strong>, up next.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>Disk &amp; file encryption</strong> — your passphrase is
              stretched into the AES key that unlocks the drive. The encryption
              demo on this site does exactly this with PBKDF2.
            </li>
            <li>
              <strong>Password managers</strong> — one master password derives the
              vault key, slowly, so a stolen vault resists offline cracking.
            </li>
            <li>
              <strong>Password storage</strong> — the same salted, slow grind is
              what a login system keeps instead of your password.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="salt" />
    </article>
  );
}
