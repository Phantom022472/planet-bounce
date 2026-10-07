import type { Metadata, Viewport } from "next";
import { Bungee, Bungee_Shade, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Stars } from "@/components/Stars";
import { ViewSwitch } from "@/components/ViewSwitch";

const display = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const shade = Bungee_Shade({ weight: "400", subsets: ["latin"], variable: "--font-shade" });
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
  themeColor: "#070f2b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${shade.variable} ${body.variable}`}>
      <body>
        <Stars />
        <ViewSwitch />
        {children}
      </body>
    </html>
  );
}
