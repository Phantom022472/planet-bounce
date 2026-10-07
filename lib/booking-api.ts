// Talks to the booking backend (Supabase). Until Supabase is connected, runs in test mode:
// some dates show as booked, and "paying" skips straight to the confirmation page.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const testMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const TEST_BOOKINGS_KEY = "pb-test-bookings";

export type BookingRequest = {
  rental_slug: string;
  date: string;
  setup_time: string;
  surface: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address_line: string;
  city: string;
  zip: string;
  notes: string;
  signer_name: string;
  signature_png: string;
  agreed: boolean;
};

export type TestBooking = BookingRequest & { code: string; created_at: string };

export type BookingSummary = {
  code: string;
  status: "pending_payment" | "confirmed" | "cancelled" | "completed";
  rental_name: string;
  start_date: string;
  end_date: string;
  total_cents: number;
  deposit_cents: number;
  paid_cents: number;
};

const headers = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function getUnavailableDates(slug: string, from: string, to: string): Promise<string[]> {
  if (testMode) {
    // A few believable booked Saturdays so the calendar shows what "taken" looks like.
    const out: string[] = [];
    const d = new Date(`${from}T12:00:00`);
    const end = new Date(`${to}T12:00:00`);
    let n = slug.length;
    while (d <= end) {
      if (d.getDay() === 6 && n++ % 3 === 0) out.push(isoDate(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_unavailable_dates`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_slug: slug, p_from: from, p_to: to }),
  });
  if (!res.ok) throw new Error("Couldn't load the calendar.");
  return (await res.json()) as string[];
}

export async function createBooking(req: BookingRequest): Promise<{ code: string; checkout_url: string }> {
  if (testMode) {
    await new Promise((r) => setTimeout(r, 700));
    const code = "PB-TEST" + Math.floor(Math.random() * 90 + 10);
    try {
      sessionStorage.setItem(`pb-test-${code}`, JSON.stringify({ rental_slug: req.rental_slug, date: req.date }));
      // Lets the owner view show bookings made while trying out the customer side.
      const saved = JSON.parse(localStorage.getItem(TEST_BOOKINGS_KEY) ?? "[]") as TestBooking[];
      saved.unshift({ ...req, code, created_at: new Date().toISOString() });
      localStorage.setItem(TEST_BOOKINGS_KEY, JSON.stringify(saved.slice(0, 10)));
    } catch {}
    return { code, checkout_url: "" };
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-booking`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(req),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again or call us.");
  return body;
}

export async function getBookingSummary(code: string): Promise<BookingSummary | null> {
  if (testMode) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_booking_summary`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_code: code }),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as BookingSummary[];
  return rows[0] ?? null;
}
