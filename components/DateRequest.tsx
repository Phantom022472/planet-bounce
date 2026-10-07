"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { rentals } from "@/content/rentals";
import { business } from "@/content/business";

// Starts online booking with the date (and rental) filled in. Rentals without a price are booked by text.
export function DateRequest() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [slug, setSlug] = useState("");
  const rental = rentals.find((r) => r.slug === slug);
  const byText = rental && rental.price == null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (byText) {
      const pretty = date
        ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
        : "";
      const body = `Hi Planet Bounce! Is the ${rental!.name} available${pretty ? ` on ${pretty}` : ""}? How much is it?`;
      window.location.href = `sms:${business.phoneRaw}?&body=${encodeURIComponent(body)}`;
      return;
    }
    const q = new URLSearchParams();
    if (slug) q.set("rental", slug);
    if (date) q.set("date", date);
    router.push(`/book/?${q}`);
  };

  return (
    <form className="datebar" onSubmit={submit}>
      <label htmlFor="party-date">
        Party date
        <input id="party-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label htmlFor="party-rental">
        Rental
        <select id="party-rental" value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Not sure yet</option>
          {rentals.map((r) => (
            <option key={r.slug} value={r.slug}>{r.name}</option>
          ))}
        </select>
      </label>
      <button className="btn btn-red" type="submit">{byText ? "Text us" : "Check this date"}</button>
      <p className="datebar-note">
        {byText
          ? "This rental is booked by text for now. We'll reply with the price and whether your date is open."
          : "See open dates and book online in a few minutes."}
      </p>
    </form>
  );
}
