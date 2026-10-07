// Marks a booking confirmed when its deposit is paid, and frees the date if checkout expires.
import { createClient } from "jsr:@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function verify(payload: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts["t"];
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(s, expected));
}

function timingSafeEqual(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  const payload = await req.text();
  if (!(await verify(payload, req.headers.get("stripe-signature")))) {
    return new Response("Bad signature", { status: 400 });
  }
  const event = JSON.parse(payload);
  const session = event.data?.object;
  const bookingId = session?.metadata?.booking_id;
  if (!bookingId) return new Response("ignored");

  if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
    await supabase
      .from("bookings")
      .update({ status: "confirmed", paid_cents: session.amount_total, hold_expires_at: null })
      .eq("id", bookingId)
      .eq("status", "pending_payment");
  } else if (event.type === "checkout.session.expired") {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending_payment");
  }
  return new Response("ok");
});
