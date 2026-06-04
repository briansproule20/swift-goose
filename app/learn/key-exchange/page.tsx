import type { Metadata } from "next";
import {
  Callout,
  LessonBody,
  LessonFooterNav,
  LessonHeader,
  Mono,
  Section,
} from "@/components/lesson";
import { DiffieHellmanMath } from "@/components/diffie-hellman-math";
import { ExchangeDemo } from "@/components/exchange-demo";

export const metadata: Metadata = {
  title: "Key Exchange · ECDH — Saltworks",
  description:
    "How two strangers agree on a shared secret over a line everyone can hear — Diffie–Hellman by hand with tiny numbers, the discrete-log trap, and the real ECDH your browser runs.",
};

export default function KeyExchangePage() {
  return (
    <article>
      <LessonHeader conceptId="exchange" />

      <LessonBody>
        <Section title="What it does">
          <p>
            Encryption needs a key both sides already share. But how do you share
            that key in the first place, if the only channel between you is one
            an attacker is listening to? Mailing it across the open wire just
            hands it to them. This is the oldest chicken-and-egg problem in
            cryptography, and for most of history the only answer was &ldquo;meet
            in person first.&rdquo;
          </p>
          <p>
            Key exchange dissolves it. Two strangers who have never met, talking
            entirely in public, can end up holding the{" "}
            <strong>same secret number</strong> — one that the eavesdropper
            watching every message cannot reconstruct. It sounds impossible. The
            math says otherwise.
          </p>
        </Section>

        <Section title="The idea: mix, swap, mix again">
          <p>
            The classic picture is paint. Everyone agrees on a common base color,
            out in the open. Each person privately mixes in a secret color of
            their own and sends the <em>mixture</em>{" "}across — and the trick is
            that un-mixing paint is hard, so the secret color stays hidden. When
            each side mixes their own secret into the color they received, both
            arrive at the identical final blend. The eavesdropper saw the two
            mixtures go by but can&apos;t separate either back into its secret.
          </p>
          <p>
            Real key exchange swaps paint for a{" "}
            <strong>one-way function</strong>: something easy to compute forward
            and brutally hard to run backward. With small numbers you can watch
            the whole thing happen.
          </p>
        </Section>

        <Section title="By hand: the modular-arithmetic version">
          <p>
            Here is Diffie–Hellman with numbers tiny enough to follow. The base{" "}
            <Mono>g</Mono> and prime <Mono>p</Mono> are public. Alice and Bob each
            pick a private exponent, raise <Mono>g</Mono> to it modulo{" "}
            <Mono>p</Mono>, and send the result. Adjust either secret and watch
            both sides still land on the same shared value:
          </p>
          <DiffieHellmanMath />
          <p>
            The forward step — <Mono>g^a mod p</Mono> — is a quick multiply. The
            reverse step — recovering <Mono>a</Mono> from the public result — is
            the <strong>discrete logarithm problem</strong>, and nobody knows a
            fast way to do it. With these toy numbers Eve cracks it in a handful
            of guesses. Scale <Mono>p</Mono>{" "}up to hundreds of digits and her
            search becomes longer than the lifetime of the universe, while
            Alice&apos;s and Bob&apos;s side stays instant.
          </p>
        </Section>

        <Section title="The real thing: ECDH on a curve">
          <p>
            Your browser doesn&apos;t use plain modular exponentiation anymore —
            it uses <strong>ECDH</strong>, the elliptic-curve version. The idea is
            identical; only the one-way function changes. Instead of raising a
            number to a power, each side multiplies a point on the P-256 curve by
            its secret. Reversing that is the elliptic-curve discrete log, which
            is even harder per bit — so the keys can be far smaller. Run a real
            exchange:
          </p>
          <ExchangeDemo />
        </Section>

        <Callout title="Forward secrecy: throw the keys away">
          <p>
            Notice the keys above are generated fresh each time. In practice
            every connection invents brand-new exchange keys and discards them
            when it ends — they&apos;re <em>ephemeral</em>. The payoff is{" "}
            <strong>forward secrecy</strong>: even if an attacker records all your
            encrypted traffic today and steals the server&apos;s long-term key
            years later, there&apos;s no ephemeral key left to recover, so the old
            conversations stay sealed forever.
          </p>
        </Callout>

        <Callout tone="trap" title="A shared secret isn't proof of who">
          <p>
            Key exchange gets you a secret shared with{" "}
            <em>whoever is on the other end</em> — but it says nothing about{" "}
            <em>who that is</em>. An attacker who sits in the middle can run a
            separate exchange with each side and quietly relay, reading
            everything. Closing that gap needs identity, and identity needs{" "}
            <strong>signatures</strong>. Bolt the two together and you&apos;ve
            nearly built the TLS handshake.
          </p>
        </Callout>

        <Section title="What it's for">
          <ul className="space-y-2">
            <li>
              <strong>The start of every HTTPS connection</strong> — before any
              page loads, your browser and the server run a key exchange to agree
              on the AES key they&apos;ll use.
            </li>
            <li>
              <strong>Messaging apps</strong> — Signal&apos;s end-to-end
              encryption ratchets a fresh exchange forward constantly, so each
              message has its own short-lived key.
            </li>
            <li>
              <strong>VPNs &amp; SSH</strong> — the same handshake bootstraps a
              private tunnel before a single byte of real data moves.
            </li>
          </ul>
        </Section>
      </LessonBody>

      <LessonFooterNav conceptId="exchange" />
    </article>
  );
}
