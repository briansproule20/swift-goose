import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { HandshakeWalkthrough } from "@/components/handshake-walkthrough";

export const metadata: Metadata = {
  title: "TLS 1.3 Handshake — Saltworks",
  description:
    "The capstone: how a real TLS 1.3 handshake stitches key exchange, signatures, hashing, and encryption into a secure channel — stepped through live, including the impersonator that gets rejected.",
};

export default function TlsHandshakePage() {
  return (
    <article>
      <LessonHeader conceptId="handshake" />

      <LessonBody>
        <Section title="What it does">
          <p>
            There&apos;s no new mathematics on this page. A handshake invents no
            primitive of its own — it&apos;s pure <em>choreography</em>. It takes
            the building blocks you&apos;ve already met and arranges them so two
            strangers finish with one shared key, each certain of who the other
            is, and an eavesdropper left holding nothing useful.
          </p>
          <p>
            This is the lock icon in your address bar. Every{" "}
            <Mono>https://</Mono> page begins with the dance below — typically in
            a single round trip, in a few milliseconds, before any content
            arrives.
          </p>
        </Section>

        <Section title="The pieces, assembled">
          <p>
            Four jobs, each handled by a tool with its own page on this site:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Key exchange</strong> gets both sides to the same secret
              over the open wire — ephemeral, so it&apos;s forward-secret.
            </li>
            <li>
              <strong>Signatures</strong> prove the server actually owns its
              certificate, which is the one thing that stops a man in the middle.
            </li>
            <li>
              <strong>Hashing</strong> stretches the raw shared secret, through a
              hash-based key schedule, into real session keys.
            </li>
            <li>
              <strong>Encryption</strong> — AES-GCM — takes over once the keys are
              set and seals every byte from there on.
            </li>
          </ul>
        </Section>

        <Section title="Watch it happen — for real">
          <p>
            The walkthrough below runs an actual, simplified TLS 1.3 handshake in
            your browser. The randoms, the public keys, the certificate
            signature, the shared secret, the derived session key, and the
            encrypted first request are all genuinely computed — nothing is
            staged. Step through it, then flip to{" "}
            <strong>impersonator</strong> to watch the signature check tear the
            connection down.
          </p>
          <HandshakeWalkthrough />
        </Section>

        <Section title="Why each piece is load-bearing">
          <p>
            Pull any one block out and the whole thing collapses in a specific,
            instructive way:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Remove signatures</strong> and you can still agree on a
              secret — but with <em>whom</em>? An attacker relays both sides and
              reads everything. This is exactly the impersonator case, and the
              signature is what catches it.
            </li>
            <li>
              <strong>Remove the ephemeral exchange</strong> (encrypt the key
              with the server&apos;s long-term key instead) and you lose forward
              secrecy: one stolen key retroactively unlocks years of recorded
              traffic.
            </li>
            <li>
              <strong>Remove encryption</strong> and you&apos;ve authenticated a
              channel that still sends everything in plain sight.
            </li>
          </ul>
        </Section>

        <Callout title="What TLS 1.3 changed">
          <p>
            Earlier versions took two round trips and offered a menu of aging,
            sometimes-broken options to negotiate. TLS 1.3 (2018) cut the
            handshake to a single round trip, deleted the weak choices outright,
            and made forward-secret ephemeral exchange mandatory. Faster{" "}
            <em>and</em> safer — the rare upgrade that&apos;s both.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>The web</strong> — HTTPS, and HTTP/3 over QUIC, which folds
              this handshake directly into the transport.
            </li>
            <li>
              <strong>Email, VPNs, APIs</strong> — the same TLS machinery secures
              mail delivery, corporate tunnels, and almost every API call your
              apps make.
            </li>
            <li>
              <strong>Anywhere two machines need a private channel</strong> —
              this is the default way to open one, billions of times a second
              across the internet.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="handshake" />
    </article>
  );
}
