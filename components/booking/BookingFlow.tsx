"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { agreement } from "@/content/agreement";
import { business } from "@/content/business";
import { rentals } from "@/content/rentals";
import { asset } from "@/lib/asset";
import { createBooking, getUnavailableDates, isoDate, testMode, type BookingRequest } from "@/lib/booking-api";
import { dollars, quote } from "@/lib/pricing";
import { Calendar } from "./Calendar";
import { SignaturePad } from "./SignaturePad";

const STEPS = ["Date", "Details", "Sign", "Pay"] as const;
const TIMES = ["8–10 am", "10 am–12 pm", "12–2 pm", "Not sure yet"];
const SURFACES = [
  { id: "grass", label: "Grass" },
  { id: "concrete", label: "Concrete or driveway" },
  { id: "indoor", label: "Indoors" },
  { id: "other", label: "Other" },
];

const bookable = rentals.filter((r) => r.price != null);

const empty: BookingRequest = {
  rental_slug: "",
  date: "",
  setup_time: "",
  surface: "grass",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  address_line: "",
  city: "",
  zip: "",
  notes: "",
  signer_name: "",
  signature_png: "",
  agreed: false,
};

const prettyDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function BookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingRequest>(empty);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [calMonth, setCalMonth] = useState<Date>(() => new Date());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const set = <K extends keyof BookingRequest>(k: K, v: BookingRequest[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Pick up ?rental= and ?date= from the home page links.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const slug = p.get("rental");
    const date = p.get("date");
    setForm((f) => ({
      ...f,
      rental_slug: bookable.some((r) => r.slug === slug) ? slug! : bookable[0]?.slug ?? "",
      date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    }));
    if (date) setCalMonth(new Date(`${date}T12:00:00`));
    if (p.get("cancelled")) setNotice("Your payment was cancelled, so the date wasn't booked. You can try again below.");
  }, []);

  // Load booked dates for the visible month plus the next one.
  useEffect(() => {
    if (!form.rental_slug) return;
    const from = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1, 12);
    const to = new Date(calMonth.getFullYear(), calMonth.getMonth() + 2, 0, 12);
    let live = true;
    setLoadingDates(true);
    getUnavailableDates(form.rental_slug, isoDate(from), isoDate(to))
      .then((d) => live && setUnavailable(new Set(d)))
      .catch(() => live && setError("We couldn't load the calendar. Please refresh, or call or text us."))
      .finally(() => live && setLoadingDates(false));
    return () => {
      live = false;
    };
  }, [form.rental_slug, calMonth]);

  // A date that turns out to be booked for the newly chosen rental gets cleared.
  useEffect(() => {
    if (form.date && unavailable.has(form.date)) set("date", "");
  }, [unavailable, form.date]);

  const rental = rentals.find((r) => r.slug === form.rental_slug);
  const q = useMemo(() => (rental?.price ? quote(rental.price) : null), [rental]);

  const stepError = (s: number): string => {
    if (s === 0) {
      if (!form.rental_slug) return "Pick a rental.";
      if (!form.date) return "Pick an open date on the calendar.";
    }
    if (s === 1) {
      if (!form.customer_name.trim()) return "Enter your name.";
      if (form.customer_phone.replace(/\D/g, "").length < 10) return "Enter a phone number we can text.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.customer_email.trim())) return "Enter a valid email.";
      if (!form.address_line.trim() || !form.city.trim() || !form.zip.trim()) return "Enter the party address.";
    }
    if (s === 2) {
      if (!form.agreed) return "Check the box to agree to the rental agreement.";
      if (!form.signer_name.trim()) return "Type your full name.";
      if (!form.signature_png) return "Sign in the box with your finger or mouse.";
    }
    return "";
  };

  const next = () => {
    const e = stepError(step);
    setError(e);
    if (!e) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    setError("");
    setStep(step - 1);
  };

  const pay = async () => {
    setError("");
    setSubmitting(true);
    try {
      const { code, checkout_url } = await createBooking(form);
      if (checkout_url) window.location.href = checkout_url;
      else router.push(`/book/done/?code=${code}&test=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again or call us.");
      setSubmitting(false);
    }
  };

  return (
    <div className="book">
      {testMode && (
        <p className="testbanner">
          <b>Test mode:</b> try it out. No real booking is made and no card is charged.
        </p>
      )}
      {notice && <p className="notice">{notice}</p>}

      <ol className="progress" aria-label="Booking steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "now" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
            <span>{i < step ? "✓" : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="book-layout">
        <section className="book-main">
          {step === 0 && (
            <>
              <h2>Pick your rental and date</h2>
              <div className="rental-pick" role="radiogroup" aria-label="Rental">
                {bookable.map((r) => (
                  <button
                    key={r.slug}
                    type="button"
                    role="radio"
                    aria-checked={form.rental_slug === r.slug}
                    className="rp"
                    onClick={() => set("rental_slug", r.slug)}
                  >
                    <img src={asset(`/rentals/${r.photos[0]}.jpg`)} alt="" />
                    <span>
                      <b>{r.name}</b>
                      <small>${r.price}</small>
                    </span>
                  </button>
                ))}
              </div>
              {rentals.length > bookable.length && (
                <p className="hint">
                  Want something else? Our other rentals are booked by text for now:{" "}
                  <a href={`sms:${business.phoneRaw}`}>{business.phone}</a>
                </p>
              )}
              <Calendar
                key={form.rental_slug}
                value={form.date}
                unavailable={unavailable}
                loading={loadingDates}
                onChange={(d) => set("date", d)}
                onMonthChange={setCalMonth}
              />
              <fieldset className="chips">
                <legend>When should we set up?</legend>
                {TIMES.map((t) => (
                  <label key={t}>
                    <input type="radio" name="setup_time" checked={form.setup_time === t} onChange={() => set("setup_time", t)} />
                    <span>{t}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <h2>Party details</h2>
              <div className="fields">
                <label htmlFor="b-name">Your name
                  <input id="b-name" autoComplete="name" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
                </label>
                <label htmlFor="b-phone">Cell phone
                  <input id="b-phone" type="tel" autoComplete="tel" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} />
                </label>
                <label htmlFor="b-email" className="wide">Email
                  <input id="b-email" type="email" autoComplete="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} />
                </label>
                <label htmlFor="b-addr" className="wide">Party address
                  <input id="b-addr" autoComplete="address-line1" value={form.address_line} onChange={(e) => set("address_line", e.target.value)} />
                </label>
                <label htmlFor="b-city">City
                  <input id="b-city" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </label>
                <label htmlFor="b-zip">ZIP
                  <input id="b-zip" inputMode="numeric" autoComplete="postal-code" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                </label>
              </div>
              <fieldset className="chips">
                <legend>Where will it go?</legend>
                {SURFACES.map((s) => (
                  <label key={s.id}>
                    <input type="radio" name="surface" checked={form.surface === s.id} onChange={() => set("surface", s.id)} />
                    <span>{s.label}</span>
                  </label>
                ))}
              </fieldset>
              <label htmlFor="b-notes" className="block">Anything we should know? (optional)
                <textarea id="b-notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  placeholder="Gate code, where to park, power outlet location…" />
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Rental agreement</h2>
              {testMode && <p className="hint">This is a draft. Planet Bounce will replace it with their own agreement.</p>}
              <div className="agreement" tabIndex={0}>
                {agreement.map((a) => (
                  <div key={a.heading}>
                    <h3>{a.heading}</h3>
                    <p>{a.text}</p>
                  </div>
                ))}
              </div>
              <label className="agree">
                <input type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)} />
                <span>I have read and agree to the rental agreement.</span>
              </label>
              <label htmlFor="b-signer" className="block">Type your full name
                <input id="b-signer" autoComplete="name" value={form.signer_name} onChange={(e) => set("signer_name", e.target.value)} />
              </label>
              <SignaturePad onChange={(png) => set("signature_png", png)} />
            </>
          )}

          {step === 3 && rental && q && (
            <>
              <h2>Review and pay deposit</h2>
              <dl className="review">
                <dt>Rental</dt><dd>{rental.name}</dd>
                <dt>Date</dt><dd>{prettyDate(form.date)}{form.setup_time ? `, set up ${form.setup_time}` : ""}</dd>
                <dt>Address</dt><dd>{form.address_line}, {form.city} {form.zip}</dd>
                <dt>Contact</dt><dd>{form.customer_name} · {form.customer_phone} · {form.customer_email}</dd>
                <dt>Agreement</dt><dd>Signed by {form.signer_name}</dd>
              </dl>
              <dl className="totals totals-main">
                <dt>Rental</dt><dd>{dollars(q.subtotal)}</dd>
                <dt>Sales tax ({Math.round(business.salesTaxRate * 100)}%)</dt><dd>{dollars(q.tax)}</dd>
                <dt className="t">Total</dt><dd className="t">{dollars(q.total)}</dd>
                <dt className="dep">Deposit due now</dt><dd className="dep">{dollars(q.deposit)}</dd>
                <dt>Due before setup</dt><dd>{dollars(q.balance)}</dd>
              </dl>
              <p className="hint">
                You&apos;ll pay the deposit on a secure Stripe page. We&apos;ll text you to confirm, and the balance is due
                before setup.
              </p>
            </>
          )}

          {error && <p className="err" role="alert">{error}</p>}

          <div className="book-nav">
            {step > 0 && <button type="button" className="btn btn-white" onClick={back} disabled={submitting}>Back</button>}
            {step < 3 && <button type="button" className="btn btn-blue" onClick={next}>Continue</button>}
            {step === 3 && q && (
              <button type="button" className="btn btn-red" onClick={pay} disabled={submitting}>
                {submitting ? "One moment…" : `Pay ${dollars(q.deposit)} deposit`}
              </button>
            )}
          </div>
        </section>

        <aside className="book-side" aria-label="Your booking">
          {rental ? (
            <>
              <img src={asset(`/rentals/${rental.photos[0]}.jpg`)} alt={rental.name} />
              <h3>{rental.name}</h3>
              <p className="side-date">{form.date ? prettyDate(form.date) : "Pick a date"}</p>
              {q && (
                <p className="side-short">
                  Total {dollars(q.total)} · <b>Deposit {dollars(q.deposit)}</b>
                </p>
              )}
              {q && (
                <dl className="totals">
                  <dt>Rental</dt><dd>{dollars(q.subtotal)}</dd>
                  <dt>Sales tax ({Math.round(business.salesTaxRate * 100)}%)</dt><dd>{dollars(q.tax)}</dd>
                  <dt className="t">Total</dt><dd className="t">{dollars(q.total)}</dd>
                  <dt className="dep">Deposit due now</dt><dd className="dep">{dollars(q.deposit)}</dd>
                  <dt>Due before setup</dt><dd>{dollars(q.balance)}</dd>
                </dl>
              )}
              <p className="side-incl">Blower and extension cord included. We drop off, set up and pick up.</p>
            </>
          ) : (
            <p>Pick a rental to see the price.</p>
          )}
          <p className="side-help">
            Questions? <Link href="/#contact">Call or text us</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
