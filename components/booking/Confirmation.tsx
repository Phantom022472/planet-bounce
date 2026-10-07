"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { business } from "@/content/business";
import { rentals } from "@/content/rentals";
import { getBookingSummary, type BookingSummary } from "@/lib/booking-api";
import { dollars, quote } from "@/lib/pricing";

type View =
  | { kind: "loading" }
  | { kind: "test"; code: string; rental?: string; date?: string; deposit?: number }
  | { kind: "real"; booking: BookingSummary }
  | { kind: "missing"; code: string };

const pretty = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export function Confirmation() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const code = (p.get("code") ?? "").toUpperCase();
    if (p.get("test")) {
      let saved: { rental_slug?: string; date?: string } = {};
      try {
        saved = JSON.parse(sessionStorage.getItem(`pb-test-${code}`) ?? "{}");
      } catch {}
      const r = rentals.find((x) => x.slug === saved.rental_slug);
      setView({ kind: "test", code, rental: r?.name, date: saved.date, deposit: r?.price ? quote(r.price).deposit : undefined });
      return;
    }
    // Stripe can take a few seconds to tell us the payment went through, so check a few times.
    let tries = 0;
    let stop = false;
    const load = async () => {
      const b = await getBookingSummary(code).catch(() => null);
      if (stop) return;
      if (b && (b.status !== "pending_payment" || tries >= 5)) setView({ kind: "real", booking: b });
      else if (!b && tries >= 5) setView({ kind: "missing", code });
      else {
        tries++;
        setTimeout(load, 2000);
      }
    };
    load();
    return () => {
      stop = true;
    };
  }, []);

  if (view.kind === "loading") return <p className="conf-wait">Checking your booking…</p>;

  if (view.kind === "missing")
    return (
      <div className="conf">
        <h1>We couldn&apos;t find that booking</h1>
        <p>Please call or text us at {business.phone} and mention code {view.code}.</p>
      </div>
    );

  const b = view.kind === "real" ? view.booking : null;
  const confirmed = view.kind === "test" || b?.status === "confirmed";
  const code = view.kind === "test" ? view.code : b!.code;

  return (
    <div className="conf">
      {view.kind === "test" && (
        <p className="testbanner"><b>Test mode:</b> this is what customers will see. Nothing was booked or charged.</p>
      )}
      <div className="conf-badge" aria-hidden="true">{confirmed ? "✓" : "…"}</div>
      <h1>{confirmed ? "You're booked!" : "Almost done"}</h1>
      <p className="conf-lead">
        {confirmed
          ? "Your deposit is paid and your date is held. We'll text you the day before with your delivery window."
          : "We're still waiting to hear that your payment went through. If you paid, there's nothing else to do. We'll text you to confirm."}
      </p>
      <dl className="review">
        <dt>Booking code</dt><dd><b>{code}</b></dd>
        {(view.kind === "test" ? view.rental : b?.rental_name) && (
          <><dt>Rental</dt><dd>{view.kind === "test" ? view.rental : b!.rental_name}</dd></>
        )}
        {(view.kind === "test" ? view.date : b?.start_date) && (
          <><dt>Date</dt><dd>{pretty((view.kind === "test" ? view.date : b!.start_date)!)}</dd></>
        )}
        {view.kind === "test" && view.deposit != null && (<><dt>Deposit</dt><dd>{dollars(view.deposit)}</dd></>)}
        {b && (
          <>
            <dt>Paid</dt><dd>{dollars(b.paid_cents)}</dd>
            <dt>Due before setup</dt><dd>{dollars(b.total_cents - b.paid_cents)}</dd>
          </>
        )}
      </dl>
      <p>Questions or changes? Call or text {business.phone} and mention your booking code.</p>
      <Link className="btn btn-blue" href="/">Back to Planet Bounce</Link>
    </div>
  );
}
