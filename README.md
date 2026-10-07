# Planet Bounce

The website (and, later, the booking system and owners' app) for Planet Bounce Party Rentals.

## Where things are

- `content/rentals.ts`: the rentals, prices and photos
- `content/business.ts`: phone numbers, email, tax rate, deposit and the deal banner
- `public/rentals/`: rental photos
- `app/page.tsx`: the home page
- `app/globals.css`: colors and layout

## Run it on your computer

```
npm install
npm run dev
```

Then open http://localhost:3000.

## Going live

Every push to `main` builds the site and publishes it with GitHub Pages (`.github/workflows/deploy.yml`).

## Roadmap

1. Website with photos, prices and text-to-book (now)
2. Online booking with live availability, e-signed rental agreement and Stripe deposit
3. Owners' dashboard: bookings, inventory, balances, documents, price and photo editing
4. Drop-off mode: photos and customer signature on delivery
