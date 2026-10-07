"use client";

import { useState } from "react";
import { rentals } from "@/content/rentals";
import { business } from "@/content/business";

// Until online booking is built, this turns the customer's choices into a ready-to-send text.
export function DateRequest() {
  const [date, setDate] = useState("");
  const [rental, setRental] = useState("");

  const pretty = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";
  const body = `Hi Planet Bounce! Is ${rental || "a bounce house"} available${pretty ? ` on ${pretty}` : ""}?`;
  const href = `sms:${business.phoneRaw}?&body=${encodeURIComponent(body)}`;

  return (
    <form className="datebar" onSubmit={(e) => { e.preventDefault(); window.location.href = href; }}>
      <label htmlFor="party-date">
        Party date
        <input id="party-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label htmlFor="party-rental">
        Rental
        <select id="party-rental" value={rental} onChange={(e) => setRental(e.target.value)}>
          <option value="">Not sure yet</option>
          {rentals.map((r) => (
            <option key={r.slug} value={r.name}>{r.name}</option>
          ))}
        </select>
      </label>
      <button className="btn btn-red" type="submit">Check this date</button>
      <p className="datebar-note">
        This opens a text to us with your date filled in. We&apos;ll text back to confirm it&apos;s free.
      </p>
    </form>
  );
}
