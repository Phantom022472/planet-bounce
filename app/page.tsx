import Link from "next/link";
import { business } from "@/content/business";
import { rentals } from "@/content/rentals";
import { LaunchPad } from "@/components/LaunchPad";
import { RentalGrid } from "@/components/RentalGrid";
import { SpotCard } from "@/components/SpotCard";
import { Spotlight } from "@/components/Spotlight";
import { asset } from "@/lib/asset";

const tax = Math.round(business.salesTaxRate * 100);
const deposit = Math.round(business.depositRate * 100);
const MARQUEE = [
  "We drop off, set up and pick up",
  "Book online in minutes",
  "Blower and cord included",
  "Family owned",
  `Call or text ${business.phone}`,
];

export default function Home() {
  const tel = `tel:${business.phoneRaw}`;
  const sms = `sms:${business.phoneRaw}`;
  const castle = rentals.find((r) => r.slug === "king-castle");
  return (
    <>
      <header className="top">
        <div className="wrap nav">
          <a href="#top" className="logo">
            <img src={asset("/logo.png")} alt="Planet Bounce Party Rentals" width={60} height={60} />
          </a>
          <nav className="links" aria-label="Main">
            <a href="#rentals">Rentals</a>
            {castle && <a href="#castle">{castle.name}</a>}
            <a href="#how">How it works</a>
            <a href="#questions">Questions</a>
          </nav>
          <Link className="btn btn-gold btn-sm" href="/book/">Book now</Link>
        </div>
      </header>

      <main id="top">
        <section className="wrap hero">
          <div className="hero-copy">
            <span className="kicker"><i />Now booking fall parties</span>
            <h1>
              Parties that are <span className="glow">out of this world</span>
            </h1>
            <p className="lead">Bounce houses, combos, water slides and axe throwing. We drop off, set up and pick up.</p>
            <LaunchPad />
          </div>
          <div className="stage">
            <div className="halo" aria-hidden="true" />
            <img className="hero-logo" src={asset("/logo-hero.jpg")} alt="Planet Bounce Party Rentals" width={600} height={600} />
            <SpotCard />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div>
            {[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>

        <section className="wrap sec" id="rentals">
          <div className="sec-head">
            <span className="eyebrow">Our rentals</span>
            <h2>Pick your bounce</h2>
            <p>
              Every rental comes with the blower and extension cord. Prices are before {tax}% sales tax, and a {deposit}% deposit
              holds your date. Tap a photo to see more.
            </p>
          </div>
          <RentalGrid />
        </section>

        {castle?.price && (
          <section className="wrap sec sec-tight" id="castle">
            <Spotlight rental={{ ...castle, price: castle.price }} blurb="Bounce, slide and a basketball hoop in one big castle. The one birthday kids ask for." />
          </section>
        )}

        <section className="wrap sec" id="how">
          <div className="sec-head">
            <span className="eyebrow">Liftoff in 3 steps</span>
            <h2>How it works</h2>
          </div>
          <div className="steps">
            <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M40 40 C 250 -10, 400 70, 500 30 S 800 -10, 960 40" fill="none" stroke="rgba(255,197,49,.6)" strokeWidth="3" strokeDasharray="10 10" />
            </svg>
            <div className="step"><span className="planet p1">1</span><div><h3>Pick a date</h3><p>You&apos;ll only see dates that are still open.</p></div></div>
            <div className="step"><span className="planet p2">2</span><div><h3>Sign and pay {deposit}%</h3><p>Sign the rental agreement on your phone and pay the deposit to hold your date.</p></div></div>
            <div className="step"><span className="planet p3">3</span><div><h3>We set it up</h3><p>We drop it off and set it up before the party, then pick it up after.</p></div></div>
          </div>
        </section>

        {business.deal.show && (
          <section className="wrap sec sec-tight">
            <div className="dealcard">
              <div>
                <span className="eyebrow dark">{business.deal.title}</span>
                <h2>{business.deal.text}</h2>
              </div>
              <Link className="btn btn-night" href="/book/">See open dates</Link>
            </div>
          </section>
        )}

        <section className="wrap sec" id="questions">
          <div className="sec-head"><span className="eyebrow">Questions</span><h2>Good to know</h2></div>
          <div className="faq">
            <details open>
              <summary>What&apos;s included?</summary>
              <p>Every rental comes with its blower and extension cord. We drop it off, set it up, and pick it up.</p>
            </details>
            <details>
              <summary>How do I hold my date?</summary>
              <p>Book online and pay a {deposit}% deposit to hold your date. The rest is due before setup.</p>
            </details>
            <details>
              <summary>Is tax included in the price?</summary>
              <p>Prices are before Florida sales tax. We add {tax}% at checkout.</p>
            </details>
            <details>
              <summary>Can I rent for more than one day?</summary>
              <p>Yes. Text or call us with your dates and we&apos;ll give you a price.</p>
            </details>
            <details>
              <summary>Do you come to my town?</summary>
              <p>Text us your address at {business.phone} and we&apos;ll let you know right away.</p>
            </details>
          </div>
        </section>

        <section className="finale" id="contact">
          <div className="wrap">
            <h2>Ready for liftoff?</h2>
            <p>Book online now, or call or text us.</p>
            <div className="btns">
              <Link className="btn btn-gold" href="/book/">Book online</Link>
              <a className="btn btn-ghost" href={sms}>Text us</a>
            </div>
            <a className="phone-line" href={tel}>{business.phone}</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <img src={asset("/logo.png")} alt="" width={84} height={84} />
          <span>
            Call or text <a href={tel}>{business.phone}</a>
            <br />
            or <a href="tel:+18632428502">{business.altPhone}</a>
          </span>
          <span>
            <a href={`mailto:${business.email}`}>{business.email}</a>
            <br />© {new Date().getFullYear()} {business.name} {business.tagline} · Family owned
            {business.serviceArea ? ` · Serving ${business.serviceArea}` : ""}
          </span>
        </div>
      </footer>

      <div className="mbar">
        <a className="btn btn-ghost" href={tel}>Call</a>
        <Link className="btn btn-gold" href="/book/">Book now</Link>
      </div>
    </>
  );
}
