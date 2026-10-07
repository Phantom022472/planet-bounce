import { business } from "@/content/business";

export type Quote = { subtotal: number; tax: number; total: number; deposit: number; balance: number };

// Mirrors the server's math in supabase/functions/create-booking. All amounts in cents.
export function quote(priceDollars: number): Quote {
  const subtotal = Math.round(priceDollars * 100);
  const tax = Math.round(subtotal * business.salesTaxRate);
  const total = subtotal + tax;
  const deposit = Math.round(total * business.depositRate);
  return { subtotal, tax, total, deposit, balance: total - deposit };
}

export const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
