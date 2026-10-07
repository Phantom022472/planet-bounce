import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { MiniHeader } from "@/components/MiniHeader";

export const metadata: Metadata = { title: "Book a bounce house | Planet Bounce" };

export default function BookPage() {
  return (
    <>
      <MiniHeader />
      <main className="wrap book-page">
        <h1>Book your party</h1>
        <BookingFlow />
      </main>
    </>
  );
}
