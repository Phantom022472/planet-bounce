import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito_Sans } from "next/font/google";
import "./globals.css";

const display = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Planet Bounce Party Rentals | Bounce Houses, Combos & Water Slides",
  description:
    "Family-owned bounce house, combo, water slide and axe throwing rentals. We deliver, set up and pick up. Call or text (863) 488-3433.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1f6fe0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
