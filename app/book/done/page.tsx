import type { Metadata } from "next";
import { Confirmation } from "@/components/booking/Confirmation";
import { MiniHeader } from "@/components/MiniHeader";

export const metadata: Metadata = { title: "Booking confirmed | Planet Bounce", robots: { index: false } };

export default function DonePage() {
  return (
    <>
      <MiniHeader />
      <main className="wrap book-page">
        <Confirmation />
      </main>
    </>
  );
}
