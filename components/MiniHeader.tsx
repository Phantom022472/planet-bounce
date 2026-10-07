import Link from "next/link";
import { business } from "@/content/business";
import { asset } from "@/lib/asset";

export function MiniHeader() {
  return (
    <header className="top mini">
      <div className="wrap nav">
        <Link href="/" className="logo">
          <img src={asset("/logo.png")} alt="Planet Bounce home" width={56} height={58} />
        </Link>
        <Link href="/#rentals" className="back">← All rentals</Link>
        <a className="btn btn-white nav-phone" href={`tel:${business.phoneRaw}`}>{business.phone}</a>
      </div>
    </header>
  );
}
