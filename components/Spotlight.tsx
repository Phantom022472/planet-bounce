"use client";

import Link from "next/link";
import { useState } from "react";
import type { Rental } from "@/content/rentals";
import { business } from "@/content/business";
import { asset } from "@/lib/asset";
import { dollars, quote } from "@/lib/pricing";

// A featured rental with a photo gallery and the real price breakdown.
export function Spotlight({ rental, blurb }: { rental: Rental & { price: number }; blurb: string }) {
  const [n, setN] = useState(0);
  const q = quote(rental.price);
  const tax = Math.round(business.salesTaxRate * 100);
  const dep = Math.round(business.depositRate * 100);
  return (
    <div className="feature">
      <div className="gallery">
        <div className="main">
          <img src={asset(`/rentals/${rental.photos[n]}.jpg`)} alt={`${rental.name}, photo ${n + 1}`} />
        </div>
        <div className="gthumbs">
          {rental.photos.map((p, i) => (
            <button key={p} type="button" aria-pressed={i === n} aria-label={`${rental.name} photo ${i + 1}`} onClick={() => setN(i)}>
              <img src={asset(`/rentals/${p}.jpg`)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      <div className="feature-info">
        <span className="eyebrow">Most booked</span>
        <h2>{rental.name}</h2>
        <p className="sub">{blurb}</p>
        <ul className="incl">
          <li>Blower and extension cord included</li>
          <li>We drop off, set up and pick up</li>
          <li>Sign the agreement on your phone</li>
        </ul>
        <dl className="receipt" aria-label="Price breakdown">
          <div><dt>{rental.name}</dt><dd>{dollars(q.subtotal)}</dd></div>
          <div><dt>Sales tax ({tax}%)</dt><dd>{dollars(q.tax)}</dd></div>
          <div className="tot"><dt>Total</dt><dd>{dollars(q.total)}</dd></div>
          <div className="dep"><dt>Due today to book ({dep}%)</dt><dd>{dollars(q.deposit)}</dd></div>
        </dl>
        <Link className="btn btn-gold" href={`/book/?rental=${rental.slug}`}>Book the {rental.name}</Link>
      </div>
    </div>
  );
}
