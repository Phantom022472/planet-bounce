"use client";

import { useEffect, useState } from "react";
import { testMode } from "@/lib/booking-api";

const BUILT = process.env.NEXT_PUBLIC_BUILD_ID;
const CHECK_EVERY = 60_000;

// While the site is still being built, shows a small panel when a newer version has gone live,
// so John and the owners can load it without hunting for refresh.
export function UpdateBanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!testMode || !BUILT) return;
    let stop = false;
    const check = async () => {
      if (stop || document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/version.json?t=${Date.now()}`, { cache: "no-store" });
        const { id } = (await res.json()) as { id?: string };
        if (id && id !== BUILT) setReady(true);
      } catch {}
    };
    const timer = setInterval(check, CHECK_EVERY);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      stop = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  if (!ready) return null;
  return (
    <div className="update" role="status">
      <span><b>New update ready.</b> Tap to see the latest changes.</span>
      <button type="button" className="btn btn-gold btn-sm" onClick={() => window.location.reload()}>Update now</button>
      <button type="button" className="update-x" aria-label="Not now" onClick={() => setReady(false)}>✕</button>
    </div>
  );
}
