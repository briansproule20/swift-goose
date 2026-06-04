import type { Metadata } from "next";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "The bench — Saltworks",
  description:
    "Type one input and watch Base64, SHA-256, and AES-GCM work on it live, side by side.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
