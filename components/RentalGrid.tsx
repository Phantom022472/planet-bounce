"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, rentals, type Category, type Rental } from "@/content/rentals";
import { business } from "@/content/business";
import { asset } from "@/lib/asset";

const photo = (name: string) => asset(`/rentals/${name}.jpg`);
const TAGS: Record<Category, string> = { bounce: "Bounce", combo: "Combo", water: "Wet or dry", game: "Game" };

function RentalCard({ rental }: { rental: Rental }) {
  const [n, setN] = useState(0);
  const many = rental.photos.length > 1;
  const current = rental.photos[n];
  return (
    <article className="card" id={rental.slug}>
      <button
        type="button"
        className="ph"
        disabled={!many}
        onClick={() => setN((x) => (x + 1) % rental.photos.length)}
        aria-label={many ? `Next photo of ${rental.name}` : undefined}
      >
        <img src={photo(current)} alt={rental.name} loading="lazy" style={{ objectPosition: n === 0 ? rental.photoFocus : undefined }} />
        <span className="cat">{TAGS[rental.category]}</span>
        {many && (
          <span className="dots" aria-hidden="true">
            {rental.photos.map((p, i) => <i key={p} className={i === n ? "on" : ""} />)}
          </span>
        )}
      </button>
      <div className="b">
        <div className="row">
          <h3>{rental.name}</h3>
          <span className={`price${rental.price ? "" : " soon"}`}>{rental.price ? `$${rental.price}` : "Text for price"}</span>
        </div>
        <ul className="features">
          {rental.features.map((f) => <li key={f}>{f}</li>)}
          <li>Blower &amp; cord included</li>
        </ul>
        {rental.price ? (
          <Link className="btn btn-gold" href={`/book/?rental=${rental.slug}`}>Book online</Link>
        ) : (
          <a
            className="btn btn-ghost"
            href={`sms:${business.phoneRaw}?&body=${encodeURIComponent(`Hi Planet Bounce! How much is the ${rental.name}, and is it open on my date? `)}`}
          >
            Text for price
          </a>
        )}
      </div>
    </article>
  );
}

export function RentalGrid() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const used = new Set(rentals.map((r) => r.category));
  const shown = rentals.filter((r) => filter === "all" || r.category === filter);
  return (
    <>
      <div className="filters" role="group" aria-label="Show rentals">
        {categories
          .filter((c) => c.id === "all" || used.has(c.id))
          .map((c) => (
            <button key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
      </div>
      <div className="grid">
        {shown.map((r) => <RentalCard key={r.slug} rental={r} />)}
      </div>
    </>
  );
}
