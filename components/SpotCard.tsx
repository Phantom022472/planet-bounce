"use client";

import { useEffect, useState } from "react";
import { categories, rentals } from "@/content/rentals";
import { asset } from "@/lib/asset";

const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "";

// Small card under the hero logo that cycles through the rentals.
export function SpotCard() {
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setFading(true);
      t = setTimeout(() => {
        setI((n) => (n + 1) % rentals.length);
        setFading(false);
      }, 300);
    }, 3500);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  const r = rentals[i];
  return (
    <a className={`spot${fading ? " swap" : ""}`} href={`#${r.slug}`}>
      <img src={asset(`/rentals/${r.photos[0]}.jpg`)} alt="" style={{ objectPosition: r.photoFocus }} />
      <span className="info">
        <small>Rent this</small>
        <b>{r.name}</b>
        <span>
          {r.price ? `$${r.price}` : "Text for price"} · <em>{label(r.category)}</em>
        </span>
        <span className="dots" aria-hidden="true">
          {rentals.map((x, n) => (
            <i key={x.slug} className={n === i ? "on" : ""} />
          ))}
        </span>
      </span>
    </a>
  );
}
