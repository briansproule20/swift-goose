import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { CertChainDemo } from "@/components/cert-chain-demo";

export const metadata: Metadata = {
  title: "Certificates & the Chain of Trust · PKI — Saltworks",
  description:
    "How signatures scale to the whole web: a chain from a trusted root through intermediates to a server's certificate. Walk a real chain, then break a link and watch the trust collapse.",
};

export default function CertificatesPage() {
  return (
    <article>
      <LessonHeader conceptId="certificates" />

      <LessonBody>
        <Section title="What it does">
          <p>
            Signatures left one question open. A signature proves a message came
            from the holder of a particular key — but how do you know{" "}
            <em>that key</em> belongs to <Mono>saltworks.dev</Mono> and not an
            impostor who generated their own? You&apos;ve never met the server.
            You can&apos;t have exchanged keys in advance.
          </p>
          <p>
            A <strong>certificate</strong> is the answer: a signed statement that
            says &ldquo;this name owns this public key,&rdquo; vouched for by
            someone you already trust. Stack those statements into a chain and you
            get <strong>public-key infrastructure</strong> — trust that scales to
            every server on the internet.
          </p>
        </Section>

        <Section title="The chain of trust">
          <p>
            Trust is delegated, in three links:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Root CAs</strong> sit at the top. A few dozen of them are
              trusted by default — their keys ship inside your browser and
              operating system. They are guarded obsessively and used rarely.
            </li>
            <li>
              <strong>Intermediate CAs</strong> are signed by a root. (&ldquo;I
              vouch for them.&rdquo;) They do the day-to-day work, so the precious
              root key can stay offline in a vault.
            </li>
            <li>
              <strong>The leaf</strong> is the server&apos;s own certificate,
              signed by an intermediate. (&ldquo;And I vouch for{" "}
              <Mono>saltworks.dev</Mono>.&rdquo;)
            </li>
          </ul>
          <p>
            Verifying a site means walking that chain upward — checking each
            signature against the key above it — until you reach a root you
            already trust. No trusted root at the end, or any broken link along
            the way, and the certificate is rejected.
          </p>
        </Section>

        <Section title="Walk it — then break a link">
          <p>
            The chain below is real: three ECDSA key pairs, each certificate
            genuinely signed by the one above it, all verified in your browser.
            It starts valid. Inject a flaw and watch exactly where, and why, the
            verification fails:
          </p>
          <CertChainDemo />
          <p>
            Each flaw fails differently. A <strong>swapped key</strong> breaks the
            leaf&apos;s signature, because it no longer covers the key being
            presented. A <strong>broken signature</strong> fails at that exact
            link. An <strong>untrusted root</strong> is the subtle one: every
            signature is mathematically valid, yet the chain is still rejected —
            because a self-signed certificate proves nothing unless its root is
            one your browser was told to trust. Anyone can mint a root; the trust
            store is what makes a handful of them special.
          </p>
        </Section>

        <Callout title="Why a chain, instead of trusting every key?">
          <p>
            Two reasons. <strong>Scale:</strong> nobody could ship a list of every
            server&apos;s key, so trust is delegated down from a small, fixed set
            of roots. <strong>Safety:</strong> the high-value root keys stay
            offline and almost never sign anything, while disposable intermediates
            do the daily issuing — and can be revoked and replaced without
            reshipping every browser on earth.
          </p>
        </Callout>

        <Callout tone="trap" title="The padlock means private, not honest">
          <p>
            A valid certificate proves you&apos;re really talking to the domain in
            the address bar, over an encrypted channel — nothing more. A phishing
            site at <Mono>saltw0rks.dev</Mono> can hold a perfectly valid
            certificate <em>for that name</em>. The chain authenticates the{" "}
            <em>connection</em>, not the <em>character</em> of whoever&apos;s on
            the other end. Read the name, not just the lock.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>HTTPS</strong> — this chain is the <em>Certificate</em> step
              of the TLS handshake. It&apos;s what lets your browser trust a
              server it&apos;s never met.
            </li>
            <li>
              <strong>Code &amp; document signing</strong> — the same PKI proves
              software updates and signed PDFs come from who they claim.
            </li>
            <li>
              <strong>Mutual TLS &amp; device identity</strong> — certificates
              also identify <em>clients</em>: services, devices, and employees
              authenticating to each other inside a network.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="certificates" />
    </article>
  );
}
