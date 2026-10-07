"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { rentals } from "@/content/rentals";
import { business } from "@/content/business";
import { getUnavailableDates, isoDate } from "@/lib/booking-api";

// Hero booking box: pick one of the next four Saturdays and a rental, then go to booking.
// Rentals without a price yet are booked by text.
export function LaunchPad() {
  const router = useRouter();
  const sats = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + (((6 - d.getDay() + 7) % 7) || 7));
    return Array.from({ length: 4 }, (_, i) => {
      const x = new Date(d);
      x.setDate(d.getDate() + i * 7);
      return x;
    });
  }, []);
  const [slug, setSlug] = useState(rentals.find((r) => r.price)?.slug ?? rentals[0].slug);
  const [date, setDate] = useState(isoDate(sats[0]));
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const rental = rentals.find((r) => r.slug === slug)!;
  const byText = rental.price == null;

  useEffect(() => {
    let live = true;
    if (byText) {
      setTaken(new Set());
      return;
    }
    getUnavailableDates(slug, isoDate(sats[0]), isoDate(sats[3]))
      .then((d) => live && setTaken(new Set(d)))
      .catch(() => live && setTaken(new Set()));
    return () => {
      live = false;
    };
  }, [slug, byText, sats]);

  useEffect(() => {
    if (taken.has(date)) setDate(isoDate(sats.find((s) => !taken.has(isoDate(s))) ?? sats[0]));
  }, [taken, date, sats]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (byText) {
      const pretty = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      const body = `Hi Planet Bounce! Is the ${rental.name} available on ${pretty}? How much is it?`;
      window.location.href = `sms:${business.phoneRaw}?&body=${encodeURIComponent(body)}`;
      return;
    }
    router.push(`/book/?rental=${slug}&date=${date}`);
  };

  return (
    <form className="launch" onSubmit={submit} aria-labelledby="launch-title">
      <h2 id="launch-title">Pick your party day</h2>
      <div className="sats" role="group" aria-label="Upcoming Saturdays">
        {sats.map((d) => {
          const iso = isoDate(d);
          const off = taken.has(iso);
          return (
            <button key={iso} type="button" className="sat" aria-pressed={iso === date} disabled={off} onClick={() => setDate(iso)}
              aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${off ? ", booked" : ""}`}>
              <small>{d.toLocaleDateString("en-US", { month: "short" })}</small>
              <b>{d.getDate()}</b>
              <em>{off ? "Booked" : "Sat"}</em>
            </button>
          );
        })}
      </div>
      <div className="pickrow">
        <label className="sr" htmlFor="launch-rental">Rental</label>
        <select id="launch-rental" value={slug} onChange={(e) => setSlug(e.target.value)}>
          {rentals.map((r) => (
            <option key={r.slug} value={r.slug}>{r.name}{r.price ? ` · $${r.price}` : ""}</option>
          ))}
        </select>
        <button className="btn btn-cyan" type="submit">{byText ? "Text us" : "Book this day"}</button>
      </div>
      <p className="launch-note">
        {byText ? (
          "This one is booked by text for now. We'll reply with the price and whether your day is open."
        ) : (
          <>Need a different day? <Link href={`/book/?rental=${slug}`}>See the full calendar</Link>.</>
        )}
      </p>
    </form>
  );
}
