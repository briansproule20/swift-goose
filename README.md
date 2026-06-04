# Saltworks

Encoding, hashing, and encryption — three things that look alike and do
completely different jobs. Type something and watch each one work on it, side by
side. Everything runs in the browser via the Web Crypto API; no backend.

|             | Reversible?       | Needs a key? | What it's for               |
| ----------- | ----------------- | ------------ | --------------------------- |
| **Encoding** (Base64)   | Yes — by anyone   | No  | Safe transport of data      |
| **Hashing** (SHA-256)   | No — one-way      | No  | Verifying integrity & identity |
| **Encryption** (AES-GCM)| Yes — with the key| Yes | Secrecy with recovery       |

## What's here

- **The bench** (`/playground`) — one input through Base64, SHA-256, and AES-GCM
  at once, with a wrong-key toggle.
- **Three write-ups** (`/learn/*`) — the idea, the math in operation, and a live
  demo for each:
  - **Encoding** — round-trip demo + the 3-bytes-to-4-characters bit packing.
  - **Hashing** — why it can't be reversed (pigeonhole collapse, no algebraic
    inverse, a 2²⁵⁶ search space), a toy `mod 12` hash, and the avalanche effect
    live.
  - **Encryption** — the XOR core, symmetric vs. asymmetric, and the wrong-key
    failure that's the whole guarantee.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui) + `motion`
- Web Crypto API (`crypto.subtle`) — SHA-256 and AES-GCM natively, Base64 via
  `btoa`/`atob`. No crypto libraries.

Crypto lives in [`lib/`](./lib): `encode.ts`, `hash.ts`, `encrypt.ts`, plus byte
helpers in `bytes.ts`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static, fully prerendered
```

## Deploy

Zero-config on Vercel — connect the repo or run `vercel`. Nothing runs
server-side, so every route is prerendered static.
