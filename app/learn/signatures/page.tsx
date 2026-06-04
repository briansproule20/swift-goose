import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { SignDemo } from "@/components/sign-demo";
import { SignatureFlow } from "@/components/signature-flow";

export const metadata: Metadata = {
  title: "Digital Signatures · ECDSA — Saltworks",
  description:
    "How a signature proves who wrote something and that nobody changed it — the public-key flip, why you sign the hash and not the message, and a live sign/verify you can break two ways.",
};

export default function SignaturesPage() {
  return (
    <article>
      <LessonHeader conceptId="sign" />

      <LessonBody>
        <Section title="What it does">
          <p>
            A digital signature answers a question the other tools can&apos;t:{" "}
            <em>who</em> produced this, and has anyone altered it since? It is
            not secrecy. A signed message stays fully readable — the signature
            travels alongside it as a separate proof.
          </p>
          <p>
            Think of it as the mirror image of encryption. Encryption hides a
            message so only the right person can read it. A signature leaves the
            message in the open but makes it so only the right person could have{" "}
            <em>written</em> it. Same key machinery, opposite goal:{" "}
            <strong>confidentiality</strong> versus{" "}
            <strong>authenticity</strong>.
          </p>
        </Section>

        <Section title="The public-key flip">
          <p>
            On the encryption page you met the split between{" "}
            <strong>symmetric</strong> keys (one shared secret) and{" "}
            <strong>asymmetric</strong> keys (a public/private pair). Signatures
            live entirely in the asymmetric world — and they use the pair{" "}
            <em>backwards</em> from how encryption does.
          </p>
          <ul className="space-y-2">
            <li>
              <strong>To sign:</strong> you use your <em>private</em> key — the
              one you never share. Only you can produce the signature.
            </li>
            <li>
              <strong>To verify:</strong> anyone uses your <em>public</em> key —
              the one you hand out freely. They can check the signature but
              could never have created it.
            </li>
          </ul>
          <p>
            That asymmetry is the whole trick. Because verifying needs only the
            public key, you can publish it on a billboard. And because signing
            needs the private key, a valid signature is something only you could
            have made — which is also why you can&apos;t later deny it. That
            property has a name: <strong>non-repudiation</strong>.
          </p>
        </Section>

        <Section title="You sign the fingerprint, not the message">
          <p>
            Public-key math is slow and works on small, fixed-size numbers — not
            on a 40&nbsp;MB PDF. So signatures borrow from hashing: you{" "}
            <strong>hash the message first</strong>, then sign the digest. The
            signature covers a compact 256-bit fingerprint that stands in for the
            entire document.
          </p>
          <SignatureFlow />
          <p>
            This is why a signature is tamper-evident for free. Change a single
            byte of the message and its hash avalanches into a completely
            different digest — so the old signature, which sealed the{" "}
            <em>old</em>{" "}digest, no longer matches. Verification fails, loudly.
            Signatures are hashing and asymmetric keys working together; that&apos;s
            why this page is{" "}
            <Mono>built from</Mono> hashing.
          </p>
        </Section>

        <Section title="Sign it, then try to break it">
          <p>
            Two fresh key pairs are generated below, entirely in your browser.
            Sign a message, then break the signature two different ways: edit the
            message after signing, or check it against someone else&apos;s public
            key. Both fail — for different reasons.
          </p>
          <SignDemo />
        </Section>

        <Callout tone="trap" title="A signature is not encryption">
          <p>
            The most common mix-up: &ldquo;it&apos;s signed&rdquo; does not mean
            &ldquo;it&apos;s secret.&rdquo; A signed email is still plain text
            anyone can read — the signature only proves it came from you,
            unaltered. If you also need it hidden, you encrypt{" "}
            <em>and</em>{" "}sign. They&apos;re separate jobs that often ride
            together.
          </p>
        </Callout>

        <Section title="Where you already trust them">
          <ul className="space-y-2">
            <li>
              <strong>Every HTTPS site</strong> — the certificate that proves a
              server is who it claims is a signed statement. You&apos;ll watch
              that exact check on the TLS page.
            </li>
            <li>
              <strong>Software updates</strong> — your OS and app stores refuse
              an update whose signature doesn&apos;t match the vendor&apos;s key,
              which is what stops a tampered install.
            </li>
            <li>
              <strong>Git commits &amp; releases</strong> — signed tags and
              commits prove who authored code.
            </li>
            <li>
              <strong>Tokens &amp; wallets</strong> — JWTs carry a signature so a
              server trusts them without a database lookup; a crypto transaction{" "}
              <em>is</em> a signature authorizing a transfer.
            </li>
          </ul>
        </Section>

        <Callout title="ECDSA, RSA, and why curves won">
          <p>
            The demo uses <strong>ECDSA</strong> — the Elliptic Curve Digital
            Signature Algorithm — on the P-256 curve. The older{" "}
            <strong>RSA</strong> does the same job with much larger keys: a
            256-bit elliptic-curve key matches the strength of a 3072-bit RSA
            one. Smaller keys and signatures mean less to send and less to
            compute, which is why modern protocols lean on curves.
          </p>
        </Callout>
      </LessonBody>

      <LessonFooterNav conceptId="sign" />
    </article>
  );
}
