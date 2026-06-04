import type { Metadata } from "next";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "The Lab — Cipher Lab",
  description:
    "Type one input and watch Base64 encoding, SHA-256 hashing, and AES-GCM encryption transform it live, side by side.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
