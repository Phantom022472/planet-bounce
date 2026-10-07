"use client";

import { useState } from "react";
import { categories, rentals, type Category, type Rental } from "@/content/rentals";
import { business } from "@/content/business";
import { asset } from "@/lib/asset";

const photo = (name: string) => asset(`/rentals/${name}.jpg`);

function RentalCard({ rental }: { rental: Rental }) {
  const [current, setCurrent] = useState(rental.photos[0]);
  return (
    <article className="card" id={rental.slug}>
      <div className="card-photo">
        <img
          src={photo(current)}
          alt={rental.name}
          loading="lazy"
          style={{ objectPosition: current === rental.photos[0] ? rental.photoFocus : undefined }}
        />
        <span className={`pricetag${rental.price ? "" : " tbd"}`}>
          {rental.price ? `$${rental.price}` : "Call for price"}
        </span>
      </div>
      {rental.photos.length > 1 && (
        <div className="thumbs">
          {rental.photos.map((p, i) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === current}
              aria-label={`Photo ${i + 1} of ${rental.name}`}
              onClick={() => setCurrent(p)}
            >
              <img src={photo(p)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="card-body">
        <h3>{rental.name}</h3>
        <ul className="features">
          {rental.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
          <li>Blower &amp; cord included</li>
        </ul>
        <a
          className="btn btn-blue"
          href={`sms:${business.phoneRaw}?&body=${encodeURIComponent(
            `Hi Planet Bounce! I'd like to book the ${rental.name}. My party date is: `,
          )}`}
        >
          Text to book
        </a>
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
        {shown.map((r) => (
          <RentalCard key={r.slug} rental={r} />
        ))}
      </div>
    </>
  );
}
