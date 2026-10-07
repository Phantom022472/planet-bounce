"use client";

import { useMemo, useState } from "react";
import { isoDate } from "@/lib/booking-api";

type Props = {
  value: string;
  unavailable: Set<string>;
  loading: boolean;
  onChange: (date: string) => void;
  onMonthChange?: (firstOfMonth: Date) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({ value, unavailable, loading, onChange, onMonthChange }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(12, 0, 0, 0);
    return t;
  }, []);
  const [month, setMonth] = useState(() => {
    const base = value ? new Date(`${value}T12:00:00`) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1, 12);
  });

  const lead = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d, 12));

  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const shift = (n: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + n, 1, 12);
    setMonth(next);
    onMonthChange?.(next);
  };

  return (
    <div className="cal" aria-busy={loading}>
      <div className="cal-head">
        <button type="button" onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month">‹</button>
        <b>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</b>
        <button type="button" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-wd">{w}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = isoDate(d);
          const past = d < today && iso !== isoDate(today);
          const taken = unavailable.has(iso);
          return (
            <button
              key={iso}
              type="button"
              className={`cal-day${iso === value ? " sel" : ""}${taken ? " taken" : ""}`}
              disabled={past || taken || loading}
              aria-pressed={iso === value}
              aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${taken ? ", booked" : ""}`}
              onClick={() => onChange(iso)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="cal-key">
        <span><i className="k-free" /> Open</span>
        <span><i className="k-taken" /> Booked</span>
        <span><i className="k-sel" /> Your date</span>
      </div>
    </div>
  );
}
