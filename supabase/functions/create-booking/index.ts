// Reserves the date, records the signed agreement, and starts a Stripe Checkout for the deposit.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const TAX_RATE = 0.08;
const DEPOSIT_RATE = 0.5;
const AGREEMENT_VERSION = "draft-2026-10-07";

const SITE_URL = Deno.env.get("SITE_URL")!; // e.g. https://phantom022472.github.io/planet-bounce
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Input = {
  rental_slug: string;
  date: string;
  setup_time?: string;
  surface?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address_line: string;
  city: string;
  zip: string;
  notes?: string;
  signer_name: string;
  signature_png: string;
  agreed: boolean;
};

function bad(message: string) {
  return json({ error: message }, 400);
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "PB-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function validate(i: Partial<Input>): string | null {
  const text = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
  if (!text(i.rental_slug, 60)) return "Pick a rental.";
  if (!text(i.date, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(i.date!)) return "Pick a party date.";
  const day = new Date(`${i.date}T12:00:00Z`).getTime();
  const today = Date.now() - 24 * 3600 * 1000;
  if (Number.isNaN(day) || day < today || day > today + 400 * 24 * 3600 * 1000) return "Pick a date within the next year.";
  if (!text(i.customer_name, 120)) return "Enter your name.";
  if (!text(i.customer_phone, 30) || i.customer_phone!.replace(/\D/g, "").length < 10) return "Enter a phone number.";
  if (!text(i.customer_email, 200) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.customer_email!)) return "Enter a valid email.";
  if (!text(i.address_line, 200) || !text(i.city, 80) || !text(i.zip, 10)) return "Enter the party address.";
  if (i.notes && i.notes.length > 1000) return "Notes are too long.";
  if (i.surface && !["grass", "concrete", "indoor", "other"].includes(i.surface)) return "Pick a setup surface.";
  if (!i.agreed) return "Please agree to the rental agreement.";
  if (!text(i.signer_name, 120)) return "Type your name to sign.";
  if (
    typeof i.signature_png !== "string" ||
    !i.signature_png.startsWith("data:image/png;base64,") ||
    i.signature_png.length > 300_000
  ) return "Please sign in the box.";
  return null;
}

async function stripeCheckout(params: Record<string, string>) {
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Stripe error");
  return body as { id: string; url: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Not found" }, 404);

  let input: Partial<Input>;
  try {
    input = await req.json();
  } catch {
    return bad("Something went wrong. Please try again.");
  }
  const problem = validate(input);
  if (problem) return bad(problem);

  const { data: rental } = await supabase
    .from("rentals")
    .select("slug, name, price_cents")
    .eq("slug", input.rental_slug!)
    .eq("active", true)
    .maybeSingle();
  if (!rental || rental.price_cents == null) return bad("That rental can't be booked online yet. Please call or text us.");

  const subtotal = rental.price_cents;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const deposit = Math.round(total * DEPOSIT_RATE);
  const code = makeCode();

  const { data: booking, error } = await supabase.rpc("reserve_booking", {
    p: {
      code,
      rental_slug: rental.slug,
      start_date: input.date,
      end_date: input.date,
      setup_time: input.setup_time ?? null,
      surface: input.surface ?? null,
      customer_name: input.customer_name!.trim(),
      customer_phone: input.customer_phone!.trim(),
      customer_email: input.customer_email!.trim(),
      address_line: input.address_line!.trim(),
      city: input.city!.trim(),
      zip: input.zip!.trim(),
      notes: input.notes?.trim() || null,
      subtotal_cents: subtotal,
      tax_cents: tax,
      total_cents: total,
      deposit_cents: deposit,
      agreement_version: AGREEMENT_VERSION,
      signer_name: input.signer_name!.trim(),
      signature_png: input.signature_png,
      signer_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });
  if (error) {
    if (error.message.includes("dates_unavailable")) return json({ error: "Sorry, that date was just booked. Please pick another." }, 409);
    if (error.message.includes("rental_not_bookable")) return bad("That rental can't be booked online yet. Please call or text us.");
    console.error(error);
    return json({ error: "Something went wrong. Please try again or call us." }, 500);
  }

  const prettyDate = new Date(`${input.date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  });
  try {
    const session = await stripeCheckout({
      mode: "payment",
      customer_email: input.customer_email!.trim(),
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(deposit),
      "line_items[0][price_data][product_data][name]": `50% deposit: ${rental.name}`,
      "line_items[0][price_data][product_data][description]": `Party on ${prettyDate}. Booking ${code}. Balance of $${((total - deposit) / 100).toFixed(2)} due before the party.`,
      "metadata[booking_id]": booking.id,
      "metadata[booking_code]": code,
      "payment_intent_data[metadata][booking_code]": code,
      expires_at: String(Math.floor(Date.now() / 1000) + 31 * 60),
      success_url: `${SITE_URL}/book/done/?code=${code}`,
      cancel_url: `${SITE_URL}/book/?rental=${rental.slug}&cancelled=1`,
    });
    await supabase.from("bookings").update({ stripe_session_id: session.id }).eq("id", booking.id);
    return json({ code, checkout_url: session.url });
  } catch (e) {
    console.error(e);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
    return json({ error: "We couldn't start the payment. Please try again or call us." }, 502);
  }
});
