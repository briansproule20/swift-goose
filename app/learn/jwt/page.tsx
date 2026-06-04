import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { JwtDemo } from "@/components/jwt-demo";

export const metadata: Metadata = {
  title: "JSON Web Tokens · JWS — Saltworks",
  description:
    "A JWT is encoding plus signatures: Base64URL claims anyone can read, sealed by a signature no one can forge. See the three parts, then tamper with a claim and watch the signature break.",
};

export default function JwtPage() {
  return (
    <article>
      <LessonHeader conceptId="jwt" />

      <LessonBody>
        <Section title="What it does">
          <p>
            A JSON Web Token is two ideas from earlier on this site, snapped
            together. Take some claims — &ldquo;this user is Ada, and she&apos;s
            an admin&rdquo; — write them as JSON, <strong>encode</strong> them so
            they survive being stuffed into an HTTP header, and then{" "}
            <strong>sign</strong> them so nobody can tamper with what you said.
          </p>
          <p>
            The result lets a server trust a request without a database lookup.
            It hands you a signed token at login; you present it on every
            request; the server checks the signature and believes the claims
            inside, because it knows only it could have signed them.
          </p>
        </Section>

        <Section title="Three parts, joined by dots">
          <p>
            A JWT is literally three Base64URL strings with dots between them:
          </p>
          <p className="font-data text-[13px] leading-relaxed">
            <span className="text-encode">base64url(header)</span>
            <span className="text-muted-foreground"> . </span>
            <span className="text-encode">base64url(payload)</span>
            <span className="text-muted-foreground"> . </span>
            <span className="text-jwt">base64url(signature)</span>
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Header</strong> — a tiny JSON object naming the algorithm,
              like <Mono>{`{"alg":"ES256","typ":"JWT"}`}</Mono>.
            </li>
            <li>
              <strong>Payload</strong> — the claims: who you are, what you can do,
              when the token expires.
            </li>
            <li>
              <strong>Signature</strong> — a signature computed over the first two
              parts. Change either one and this stops matching.
            </li>
          </ul>
        </Section>

        <Section title="Read it, then try to forge it">
          <p>
            The token below is issued and signed in your browser. First notice
            you can <em>read</em> every claim — no key needed. Then edit the{" "}
            <Mono>role</Mono> claim to <Mono>admin</Mono> and watch what the
            server does:
          </p>
          <JwtDemo />
        </Section>

        <Callout tone="trap" title="Encoded is not encrypted">
          <p>
            This trips up nearly everyone: the payload is{" "}
            <strong>not secret</strong>. It&apos;s Base64, not encryption — the
            same lesson from the encoding page. Anyone holding the token can read
            every claim in it. So never put a password, a card number, or
            anything private in a JWT payload. The signature stops{" "}
            <em>tampering</em>, not <em>reading</em>. If you need the contents
            hidden too, encrypt them.
          </p>
        </Callout>

        <Section title="Why the signature is the whole point">
          <p>
            Because the claims are readable and self-contained, the obvious
            attack is to just edit them — change <Mono>role: user</Mono> to{" "}
            <Mono>role: admin</Mono> and send it back. The signature is what makes
            that fail. It covers the exact bytes of the header and payload, so any
            edit invalidates it, and only the holder of the signing key can
            produce a fresh valid one. This is the{" "}
            <strong>signatures</strong> lesson doing its job, applied to a token.
          </p>
          <p>
            Two flavors are common. <Mono>HS256</Mono> signs with a shared secret
            (an <em>HMAC</em>) — simple, but everyone who can verify can also
            forge, so it only works inside one trust boundary. <Mono>ES256</Mono>{" "}
            and <Mono>RS256</Mono> sign with a private key and verify with the
            public one, so a third party can check a token without being able to
            mint it. The demo above uses ES256.
          </p>
        </Section>

        <Callout title="Claims have an expiry — and that's load-bearing">
          <p>
            Because nothing is looked up server-side, a stolen token is valid
            until it expires. That&apos;s why payloads carry an <Mono>exp</Mono>{" "}
            timestamp and real systems keep token lifetimes short, pairing a
            brief access token with a longer-lived refresh token. A signature
            proves a claim is authentic; it can&apos;t un-issue one.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>Stateless sessions</strong> — APIs verify a signed token
              instead of hitting a session store on every request.
            </li>
            <li>
              <strong>Single sign-on</strong> — OpenID Connect ships identity as
              a signed JWT, so one login works across many services.
            </li>
            <li>
              <strong>Service-to-service auth</strong> — signed tokens let
              backends prove who they are to each other without sharing
              passwords.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="jwt" />
    </article>
  );
}
