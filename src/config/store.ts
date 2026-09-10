/**
 * Central store configuration.
 * Change the store name, currency and delivery fee here — nothing else needs editing.
 */

export const STORE_NAME = "GameVault";
export const STORE_TAGLINE = "Your next adventure starts here.";

/** Currency settings. Prices are stored as integer minor units (öre). */
export const CURRENCY_CODE = "SEK";
export const CURRENCY_SUFFIX = "kr";

/** Flat delivery fee, charged once per order that contains physical products. */
export const SHIPPING_FEE_MINOR = 4900; // 49 kr

/** Delivery is limited to Sweden in this version. */
export const DELIVERY_COUNTRY = "Sweden";

export type PlatformId = "ps5" | "xbox" | "pc";

export type PlatformInfo = {
  id: PlatformId;
  name: string;
  shortName: string;
  slug: string;
  blurb: string;
  /** Tailwind classes driven by design tokens. */
  accentClass: string;
  chipClass: string;
};

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "ps5",
    name: "PlayStation 5",
    shortName: "PS5",
    slug: "ps5",
    blurb: "Disc and digital games for Sony's current generation console.",
    accentClass: "text-ps",
    chipClass: "bg-ps/15 text-ps ring-1 ring-ps/30",
  },
  {
    id: "xbox",
    name: "Xbox Series X|S",
    shortName: "Xbox",
    slug: "xbox",
    blurb: "Digital titles for Series X and Series S, plus discs for Series X.",
    accentClass: "text-xbox",
    chipClass: "bg-xbox/15 text-xbox ring-1 ring-xbox/30",
  },
  {
    id: "pc",
    name: "PC",
    shortName: "PC",
    slug: "pc",
    blurb: "Digital PC downloads with clearly listed activation platforms.",
    accentClass: "text-pc",
    chipClass: "bg-pc/15 text-pc ring-1 ring-pc/30",
  },
];

export function getPlatform(id: string): PlatformInfo | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/** Format an integer amount of öre as "799 kr". */
export function formatPrice(minor: number): string {
  const value = minor / 100;
  const formatted = Number.isInteger(value)
    ? new Intl.NumberFormat("sv-SE").format(value)
    : new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2 }).format(value);
  return `${formatted} ${CURRENCY_SUFFIX}`;
}
