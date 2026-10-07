import type { Metadata } from "next";
import { OwnerApp } from "@/components/owner/OwnerApp";

export const metadata: Metadata = { title: "Owner | Planet Bounce", robots: { index: false } };

export default function OwnerPage() {
  return <OwnerApp />;
}
