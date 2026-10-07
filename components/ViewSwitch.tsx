"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { testMode } from "@/lib/booking-api";

// While the system is being built, lets John and the owners flip between what customers
// and owners see. Once owner logins exist, the Owner side moves behind a sign-in.
export function ViewSwitch() {
  const path = usePathname();
  if (!testMode) return null;
  const owner = path.startsWith("/owner");
  return (
    <nav className="viewswitch" aria-label="Switch view">
      <span>Viewing as</span>
      <Link href="/" aria-current={!owner ? "page" : undefined}>Customer</Link>
      <Link href="/owner/" aria-current={owner ? "page" : undefined}>Owner</Link>
    </nav>
  );
}
