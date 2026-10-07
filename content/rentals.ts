// The rental list. Owners will manage this from their app later; until then, edit it here.
// price: null shows "Call for price".
export type Category = "bounce" | "combo" | "water" | "game";

export type Rental = {
  slug: string;
  name: string;
  category: Category;
  features: string[];
  price: number | null;
  photos: string[];
  photoFocus?: string; // CSS object-position for the main photo
};

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bounce", label: "Bounce houses" },
  { id: "combo", label: "Combos & slides" },
  { id: "water", label: "Water slides" },
  { id: "game", label: "Games" },
];

export const rentals: Rental[] = [
  {
    slug: "king-castle",
    name: "King Castle",
    category: "combo",
    features: ["Bounce + slide + basketball hoop"],
    price: 208,
    photos: ["king-castle-1", "king-castle-2", "king-castle-3", "king-castle-4"],
  },
  {
    slug: "jungle-jump",
    name: "Jungle Jump",
    category: "bounce",
    features: ["Bounce house"],
    price: null, // TODO
    photos: ["jungle-jump-1", "jungle-jump-2"],
    photoFocus: "50% 62%",
  },
  {
    slug: "toxic-bounce",
    name: "Toxic Bounce",
    category: "bounce",
    features: ["Bounce house"],
    price: null, // TODO
    photos: ["toxic-bounce-1", "toxic-bounce-2"],
    photoFocus: "50% 62%",
  },
  {
    slug: "rainbow-combo",
    name: "Rainbow Combo", // TODO: real name
    category: "combo",
    features: ["Bounce + slide"],
    price: null, // TODO
    photos: ["rainbow-combo-1", "rainbow-combo-2"],
    photoFocus: "50% 45%",
  },
  {
    slug: "marble-splash",
    name: "Marble Splash Combo", // TODO: real name
    category: "water",
    features: ["Water slide + bounce", "Wet or dry"],
    price: null, // TODO
    photos: ["marble-splash-1"],
  },
  {
    slug: "axe-throwing",
    name: "Axe Throwing",
    category: "game",
    features: ["2 lanes", "17 × 10 ft, 9 ft tall"],
    price: null, // TODO
    photos: ["axe-throwing-1", "axe-throwing-2"],
  },
];
