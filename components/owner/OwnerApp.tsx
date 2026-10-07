"use client";

import { useEffect, useMemo, useState } from "react";
import { business } from "@/content/business";
import { rentals as catalog } from "@/content/rentals";
import { asset } from "@/lib/asset";
import { TEST_BOOKINGS_KEY, type TestBooking } from "@/lib/booking-api";
import { dollars, quote } from "@/lib/pricing";
import { DropOff } from "./DropOff";

export type OwnerBooking = {
  code: string;
  customer: string;
  phone: string;
  rental: string;
  date: string; // yyyy-mm-dd
  when: string;
  address: string;
  total: number; // cents
  paid: number; // cents
  signed: boolean;
  status: "confirmed" | "out" | "returned" | "unsigned";
  example: boolean;
  items: string[];
};

type Tab = "today" | "bookings" | "rentals" | "docs";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const pretty = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const kingTotal = quote(208).total;

// Made-up bookings so the owner view has something to show. Never real customers.
const EXAMPLES: OwnerBooking[] = [
  { code: "PB-EX01", customer: "Example: Maria L.", phone: "(555) 010-0101", rental: "King Castle", date: addDays(0), when: "Drop off 9 am · pick up 7 pm", address: "412 Oak Hill Dr", total: kingTotal, paid: Math.round(kingTotal / 2), signed: true, status: "confirmed", example: true, items: ["King Castle", "Blower", "Extension cord", "Stakes", "Ground tarp"] },
  { code: "PB-EX02", customer: "Example: Derrick J.", phone: "(555) 010-0102", rental: "Toxic Bounce", date: addDays(0), when: "Pick up 6 pm", address: "88 Lake Shore Ln", total: 18900, paid: 18900, signed: true, status: "out", example: true, items: ["Toxic Bounce", "Blower", "Extension cord", "Stakes"] },
  { code: "PB-EX03", customer: "Example: Tasha G.", phone: "(555) 010-0103", rental: "Jungle Jump", date: addDays(3), when: "Drop off 10 am", address: "1500 Pine Ave", total: 18900, paid: 9450, signed: true, status: "confirmed", example: true, items: ["Jungle Jump", "Blower", "Extension cord", "Stakes"] },
  { code: "PB-EX04", customer: "Example: Kevin R.", phone: "(555) 010-0104", rental: "Axe Throwing", date: addDays(10), when: "Drop off 11 am", address: "27 Orange Blossom Ct", total: 27000, paid: 0, signed: false, status: "unsigned", example: true, items: ["Axe Throwing", "Blower", "Extension cord", "Axes"] },
];

const DOCS = [
  { name: "County business license", info: "Add the expiration date", tag: "" },
  { name: "Liability insurance", info: "Add the renewal date", tag: "" },
  { name: "Inflatable inspection certificates", info: "One per unit", tag: "" },
  { name: "Signed rental agreements", info: "Saved here automatically with each booking", tag: "Auto" },
  { name: "Receipts & expenses", info: "Fuel, repairs, supplies", tag: "" },
];

function fromTest(t: TestBooking): OwnerBooking {
  const r = catalog.find((x) => x.slug === t.rental_slug);
  const q = r?.price ? quote(r.price) : null;
  return {
    code: t.code,
    customer: t.customer_name,
    phone: t.customer_phone,
    rental: r?.name ?? t.rental_slug,
    date: t.date,
    when: t.setup_time ? `Set up ${t.setup_time}` : "Set-up time not chosen",
    address: `${t.address_line}, ${t.city}`,
    total: q?.total ?? 0,
    paid: q?.deposit ?? 0,
    signed: !!t.signature_png,
    status: "confirmed",
    example: false,
    items: [r?.name ?? "Rental", "Blower", "Extension cord", "Stakes or sandbags"],
  };
}

export function OwnerApp() {
  const [tab, setTab] = useState<Tab>("today");
  const [tests, setTests] = useState<OwnerBooking[]>([]);
  const [prices, setPrices] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(catalog.map((r) => [r.slug, r.price])),
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [dropFor, setDropFor] = useState<OwnerBooking | null>(null);
  const [droppedOff, setDroppedOff] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TEST_BOOKINGS_KEY) ?? "[]") as TestBooking[];
      setTests(saved.map(fromTest));
    } catch {}
  }, []);

  const all = useMemo(
    () => [...tests, ...EXAMPLES].sort((a, b) => a.date.localeCompare(b.date)),
    [tests],
  );
  const today = addDays(0);
  const todays = all.filter((b) => b.date === today);
  const owed = all.reduce((s, b) => s + (b.total - b.paid), 0);
  const outNow = all.filter((b) => b.status === "out" || droppedOff.has(b.code));

  const statusPill = (b: OwnerBooking) => {
    if (droppedOff.has(b.code)) return <span className="pill p-out">Dropped off</span>;
    if (b.status === "out") return <span className="pill p-out">Out now</span>;
    if (b.status === "unsigned") return <span className="pill p-due">Needs signature</span>;
    return <span className="pill p-ok">Booked</span>;
  };

  const card = (b: OwnerBooking, actions?: React.ReactNode) => {
    const due = b.total - b.paid;
    return (
      <article className="ocard" key={b.code}>
        <div className="orow">
          <h3>{b.customer}</h3>
          {statusPill(b)}
        </div>
        <p className="ometa">
          {b.rental} · {pretty(b.date)}
          <br />
          {b.when}
          <br />
          {b.address}
        </p>
        <div className="omoney">
          <span>Total <b>{dollars(b.total)}</b></span>
          <span>Paid <b>{dollars(b.paid)}</b></span>
          <span>{due > 0 ? <>Owes <b className="owe">{dollars(due)}</b></> : <b className="paidfull">Paid in full</b>}</span>
        </div>
        <div className="ochecks">
          <span className={b.signed ? "y" : "n"}>{b.signed ? "✓ Agreement signed" : "✗ Not signed yet"}</span>
          <span className={b.paid ? "y" : "n"}>{b.paid ? "✓ Deposit in" : "✗ No deposit"}</span>
          {!b.example && <span className="newtag">From your test booking</span>}
        </div>
        {actions}
      </article>
    );
  };

  const savePrice = (slug: string) => {
    const n = Number(draftPrice);
    setPrices((p) => ({ ...p, [slug]: draftPrice.trim() === "" ? null : Number.isFinite(n) && n > 0 ? Math.round(n) : p[slug] }));
    setEditing(null);
  };

  const TITLES: Record<Tab, string> = { today: "Today", bookings: "Bookings", rentals: "Rentals", docs: "Documents" };

  return (
    <div className="owner">
      <div className="ophone">
        <header className="obar">
          <div>
            <h1>{TITLES[tab]}</h1>
            <small>{tab === "today" ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Planet Bounce owners"}</small>
          </div>
          <img src={asset("/logo.png")} alt="" width={44} height={46} />
        </header>

        <main className="obody">
          <p className="otest">Preview with example bookings. Bookings you make on the customer side show up here too.</p>

          {tab === "today" && (
            <>
              <div className="ostats">
                <div><b>{todays.length}</b><span>Jobs today</span></div>
                <div><b>{outNow.length}</b><span>Out now</span></div>
                <div className="owe"><b>{dollars(owed)}</b><span>Still owed</span></div>
              </div>
              {todays.length === 0 && <p className="oempty">Nothing scheduled today.</p>}
              {todays.map((b) =>
                card(
                  b,
                  <div className="obtns">
                    {b.status === "out" || droppedOff.has(b.code) ? (
                      <button type="button" className="obtn dark">Start pick-up</button>
                    ) : (
                      <button type="button" className="obtn sun" onClick={() => setDropFor(b)}>Start drop-off</button>
                    )}
                    <a className="obtn line" href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`} target="_blank" rel="noreferrer">Directions</a>
                  </div>,
                ),
              )}
              <h2 className="osub">Coming up</h2>
              {all.filter((b) => b.date > today).slice(0, 3).map((b) => card(b))}
            </>
          )}

          {tab === "bookings" && (
            <>
              <h2 className="osub">{all.length} bookings</h2>
              {all.map((b) =>
                card(
                  b,
                  !b.signed && (
                    <div className="obtns">
                      <button type="button" className="obtn line">Text the agreement link</button>
                    </div>
                  ),
                ),
              )}
            </>
          )}

          {tab === "rentals" && (
            <>
              <p className="ohint">Tap a price to change it. In the finished app, the website updates as soon as you save.</p>
              {catalog.map((r) => (
                <article className="ocard oinv" key={r.slug}>
                  <img src={asset(`/rentals/${r.photos[0]}.jpg`)} alt="" />
                  <div>
                    <h3>{r.name}</h3>
                    <span className={`pill ${outNow.some((b) => b.rental === r.name) ? "p-out" : "p-ok"}`}>
                      {outNow.some((b) => b.rental === r.name) ? "Out now" : "Available"}
                    </span>
                  </div>
                  <div className="oprice">
                    {editing === r.slug ? (
                      <>
                        <label className="sr" htmlFor={`price-${r.slug}`}>New price for {r.name}</label>
                        $<input id={`price-${r.slug}`} type="number" inputMode="numeric" value={draftPrice} autoFocus
                          onChange={(e) => setDraftPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePrice(r.slug)} />
                        <button type="button" onClick={() => savePrice(r.slug)}>Save</button>
                      </>
                    ) : (
                      <>
                        <b>{prices[r.slug] != null ? `$${prices[r.slug]}` : "No price"}</b>
                        <button type="button" onClick={() => { setEditing(r.slug); setDraftPrice(prices[r.slug]?.toString() ?? ""); }}>
                          Edit price
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
              <button type="button" className="obtn sun wide">+ Add a rental</button>
            </>
          )}

          {tab === "docs" && (
            <>
              <label className="oupload" htmlFor="doc-up">
                📷 Add a document or receipt
                <small>Take a photo or pick a file</small>
                <input id="doc-up" type="file" accept="image/*,application/pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploads((u) => [f.name, ...u]); e.target.value = ""; }} />
              </label>
              {uploads.map((n, i) => (
                <article className="ocard odoc" key={`${n}-${i}`}>
                  <span className="oic">✓</span>
                  <div><h3>{n}</h3><p className="ometa">Added just now (preview only, not saved)</p></div>
                </article>
              ))}
              {DOCS.map((d) => (
                <article className="ocard odoc" key={d.name}>
                  <span className="oic">📄</span>
                  <div><h3>{d.name}</h3><p className="ometa">{d.info}</p></div>
                  {d.tag && <span className="pill p-ok">{d.tag}</span>}
                </article>
              ))}
              <p className="ohint">The app will remind you 30 days before a license or insurance policy expires.</p>
            </>
          )}
        </main>

        <nav className="otabs" aria-label="Owner sections">
          {(["today", "bookings", "rentals", "docs"] as Tab[]).map((t) => (
            <button key={t} type="button" aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>
              {TITLES[t]}
            </button>
          ))}
        </nav>

        {dropFor && (
          <DropOff
            booking={dropFor}
            onClose={() => setDropFor(null)}
            onDone={() => { setDroppedOff((s) => new Set(s).add(dropFor.code)); }}
          />
        )}
      </div>
      <p className="ofoot">
        Owners will sign in to see this. Customers never see it. Questions: {business.phone}
      </p>
    </div>
  );
}
