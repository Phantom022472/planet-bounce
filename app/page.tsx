import { business } from "@/content/business";
import { DateRequest } from "@/components/DateRequest";
import { RentalGrid } from "@/components/RentalGrid";
import { asset } from "@/lib/asset";

const tax = Math.round(business.salesTaxRate * 100);
const deposit = Math.round(business.depositRate * 100);

export default function Home() {
  const tel = `tel:${business.phoneRaw}`;
  const sms = `sms:${business.phoneRaw}`;
  return (
    <>
      <header className="top" id="top">
        <div className="wrap nav">
          <a href="#top" className="logo">
            <img src={asset("/logo.png")} alt="Planet Bounce Party Rentals" width={64} height={66} />
          </a>
          <nav className="links" aria-label="Main">
            <a href="#rentals">Rentals</a>
            <a href="#how">How it works</a>
            <a href="#questions">Questions</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="btn btn-red nav-call" href={tel}>{business.phone}</a>
        </div>

        <section className="wrap hero">
          <div>
            <h1>
              Bounce houses that are <em>out of this world</em>
            </h1>
            <p className="sub">
              Bounce houses, combos, water slides and games for your next party. We drop off, set up and pick up.
            </p>
            <DateRequest />
          </div>
          <div className="hero-media">
            <div className="hero-pic">
              <img src={asset("/rentals/king-castle-1.jpg")} alt="The King Castle combo set up in a backyard" />
            </div>
            <div className="sticker">We set up<br />&amp; pick up!</div>
          </div>
        </section>
        <svg className="wave" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 C200 0 400 0 600 20 S1000 40 1200 10 V40Z" fill="currentColor" />
        </svg>
      </header>

      {business.deal.show && (
        <div className="deal">
          <b>{business.deal.title}:</b> {business.deal.text}
        </div>
      )}

      <main>
        <section className="sec" id="rentals">
          <div className="wrap">
            <h2>Pick your bounce</h2>
            <p className="lead">
              Every rental comes with the blower and extension cord. Prices are before {tax}% sales tax, and a{" "}
              {deposit}% deposit holds your date. Tap the small photos to see more.
            </p>
            <RentalGrid />
          </div>
        </section>

        <section className="sec steps-sec" id="how">
          <div className="wrap">
            <h2>Booking is easy</h2>
            <ol className="steps">
              <li>
                <span className="n">1</span>
                <h3>Pick a rental and a date</h3>
                <p>You&apos;ll only see dates that are still open.</p>
              </li>
              <li>
                <span className="n">2</span>
                <h3>Sign and pay the deposit</h3>
                <p>Sign the rental agreement on your phone and pay {deposit}% to hold your date.</p>
              </li>
              <li>
                <span className="n">3</span>
                <h3>We bring the fun</h3>
                <p>We drop it off and set it up before the party, then pick it up after.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="sec" id="questions">
          <div className="wrap faq">
            <h2>Good to know</h2>
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
          </div>
        </section>

        <section className="sec contact-sec" id="contact">
          <div className="wrap contact">
            <div>
              <h2>Questions? Call or text</h2>
              <a className="phonebig" href={tel}>{business.phone}</a>
              <p>
                Also: <a href={`tel:+18632428502`}>{business.altPhone}</a> ·{" "}
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </p>
            </div>
            <a className="btn btn-yellow" href={sms}>Text us</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          © {new Date().getFullYear()} {business.name} {business.tagline} · Family owned
          {business.serviceArea ? ` · Serving ${business.serviceArea}` : ""}
        </div>
      </footer>

      <div className="mbar">
        <a className="btn btn-white" href={tel}>Call</a>
        <a className="btn btn-red" href={sms}>Text us</a>
      </div>
    </>
  );
}
