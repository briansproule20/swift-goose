# Cipher Lab — Encoding vs. Hashing vs. Encryption

An interactive teaching site that demystifies the three things everyone confuses.
Type something in, watch all three transform it side by side, and read short
guided lessons that explain *what each does and when to reach for it*.

Everything runs in the browser via the **Web Crypto API** — no backend, no
secrets to manage, deploys static.

> Encoding moves data safely · Hashing fingerprints it · Encryption keeps it secret.

|             | Reversible?       | Needs a key? | Job                         |
| ----------- | ----------------- | ------------ | --------------------------- |
| **Encoding** (Base64)   | Yes — by anyone   | No  | Safe transport of data      |
| **Hashing** (SHA-256)   | No — one-way      | No  | Verifying integrity & identity |
| **Encryption** (AES-GCM)| Yes — with the key| Yes | Secrecy with recovery       |

## What's inside

- **The Lab** (`/playground`) — one input flows live through Base64, SHA-256, and
  AES-GCM at once, each colour-coded (amber / mint / violet).
- **Three lessons** (`/learn/*`) — conceptual, short, each ending in a live demo:
  - **Encoding** — encode → decode round-trip, padding, the +33% cost, and the
    trap that Base64 *looks* encrypted but isn't.
  - **Hashing** — the **avalanche effect**: flip one character, watch ~half the
    output bits change.
  - **Encryption** — lock with one key, try to unlock with another, and see the
    *wrong-key failure* that is the whole point.

## Tech

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui) + **motion** for aceternity-style effects
- **Web Crypto API** (`crypto.subtle`) — SHA-256 and AES-GCM natively, Base64 via
  `btoa`/`atob`. No crypto libraries.

All cryptography lives in [`lib/`](./lib): `encode.ts`, `hash.ts`, `encrypt.ts`,
with shared byte helpers in `bytes.ts`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static, fully prerendered
```

## Deploy

Zero-config on **Vercel** — connect the GitHub repo or run `vercel`. Nothing
server-side, so every route is prerendered as static HTML.

---

Built as a hands-on tour of the GitHub → Vercel loop, the App Router, and a real
browser crypto API. Conceptual depth over cryptographic engineering — we use
Web Crypto, we don't reimplement it.
