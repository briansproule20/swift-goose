const ERAS = [
  {
    when: "~50 BCE",
    title: "The Caesar shift",
    body: "Rome moves every letter a fixed number of places. Secret for exactly as long as nobody thinks to try the other 24 shifts.",
  },
  {
    when: "9th century",
    title: "Frequency analysis",
    body: "The polymath al-Kindi notices some letters appear more than others, and cracks any simple letter-for-letter substitution. Codes now have to be cleverer than the codebreakers.",
  },
  {
    when: "1553",
    title: "The Vigenère cipher",
    body: "A keyword changes the shift letter by letter. Dubbed le chiffre indéchiffrable — the unbreakable cipher — for three centuries, until Babbage and Kasiski broke it anyway.",
  },
  {
    when: "1940s",
    title: "Enigma",
    body: "Germany's rotor machine scrambles each keystroke differently. Bletchley Park — Turing among them — breaks it, and the line between cryptography and computing starts to blur.",
  },
  {
    when: "1976–77",
    title: "Public keys",
    body: "Diffie–Hellman, then RSA, crack the oldest problem: agreeing on a key with someone you've never met, over a line everyone can hear. Modern secure communication starts here.",
  },
  {
    when: "2001",
    title: "AES",
    body: "A worldwide competition picks the algorithm you used a moment ago. Two decades on, still no practical break.",
  },
];

export function EncryptionTimeline() {
  return (
    <ol className="relative ml-1 space-y-6 border-l border-border pl-6">
      {ERAS.map((era) => (
        <li key={era.when} className="relative">
          <span className="absolute -left-[1.65rem] top-1.5 size-2.5 rounded-full border-2 border-encrypt bg-background" />
          <div className="flex flex-col gap-0.5">
            <span className="label-spec text-encrypt/90">{era.when}</span>
            <h3 className="font-display text-xl leading-tight">{era.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {era.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
