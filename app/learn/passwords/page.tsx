import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { PasswordDemo } from "@/components/password-demo";

export const metadata: Metadata = {
  title: "Password Storage — Saltworks",
  description:
    "Why a leaked database still shouldn't give up your password: store the proof, not the secret. Rainbow tables on bare hashes, salted slow hashing, and a live login that never stores the password.",
};

export default function PasswordsPage() {
  return (
    <article>
      <LessonHeader conceptId="passwords" />

      <LessonBody>
        <Section title="What it does">
          <p>
            The single rule of password storage: a server should never be able to
            tell you your own password. It keeps just enough to{" "}
            <em>check</em> a guess — never enough to <em>recover</em>{" "}the
            original. So at sign-up it doesn&apos;t store your password; it stores
            a one-way, salted, slow hash of it. At login it runs the same
            transform on what you typed and compares the results.
          </p>
          <p>
            Done right, a stolen database is a pile of useless fingerprints. Done
            wrong, it&apos;s a spreadsheet of everyone&apos;s password.
          </p>
        </Section>

        <Section title="Why hashing alone isn't enough">
          <p>
            &ldquo;Just hash it&rdquo; sounds safe — a hash is one-way, after all.
            But a bare hash is <em>deterministic</em>, and that&apos;s the leak.
            The same password always produces the same digest, which hands an
            attacker two free wins: identical passwords are visibly identical, and
            a single <strong>rainbow table</strong> of common-password hashes
            reverses them all at once.
          </p>
          <p>
            Toggle the leaked table below between bare <Mono>SHA-256</Mono> and
            salted <Mono>PBKDF2</Mono>. Watch Alice and Bob — who picked the same
            password — and watch the rainbow table do its work:
          </p>
          <PasswordDemo />
        </Section>

        <Section title="Salt, then slow it down">
          <p>
            The fix is the previous page&apos;s two ideas, applied to storage.{" "}
            <strong>A unique salt per user</strong> makes every stored hash
            different — even when two people share a password — so collisions
            vanish and precomputed tables die. Then a{" "}
            <strong>deliberately slow</strong> hash (PBKDF2, or better,{" "}
            <Mono>bcrypt</Mono> / <Mono>scrypt</Mono> / <Mono>Argon2</Mono>) means
            each remaining guess costs real time. An attacker who steals the
            database still has to brute-force every account separately, slowly.
          </p>
          <p>
            In the login box above, the server verifies carol&apos;s password
            without ever holding it. It re-derives the hash from her guess and the
            stored salt, and compares — that&apos;s all it can do, and all it
            should be able to do.
          </p>
        </Section>

        <Callout tone="trap" title="If a site can email you your password, run">
          <p>
            A correctly built system <em>cannot</em>{" "}recover your password — it
            only stored a one-way hash. So &ldquo;here is your password&rdquo; in
            an email means they stored it in a form they can read, which means a
            breach hands it straight to an attacker. Real systems reset passwords
            (set a new one); they never retrieve the old one.
          </p>
        </Callout>

        <Callout title="The hash isn't the last line — it's the last-but-one">
          <p>
            Salted slow hashing buys time after a breach; it doesn&apos;t make
            weak passwords strong. A user who picks <Mono>123456</Mono>{" "}is still
            cracked quickly, salt or no salt. That&apos;s why the modern stack adds{" "}
            <strong>multi-factor authentication</strong> and breach monitoring on
            top — defense in depth, not a single clever hash.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>Every login you&apos;ve ever made</strong> — this is the
              standard server-side handling of account passwords.
            </li>
            <li>
              <strong>API keys &amp; tokens at rest</strong> — the same
              store-the-hash pattern lets a service verify a secret it never keeps
              in readable form.
            </li>
            <li>
              <strong>Anywhere you verify a secret you shouldn&apos;t hold</strong>{" "}
              — the goal is always to prove knowledge without storing the thing
              itself.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="passwords" />
    </article>
  );
}
