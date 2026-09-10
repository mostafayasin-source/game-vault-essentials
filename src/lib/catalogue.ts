import coverAction from "@/assets/cover-action.jpg";
import coverAdventure from "@/assets/cover-adventure.jpg";
import coverHorror from "@/assets/cover-horror.jpg";
import coverRacing from "@/assets/cover-racing.jpg";
import coverRpg from "@/assets/cover-rpg.jpg";
import coverShooter from "@/assets/cover-shooter.jpg";
import coverSports from "@/assets/cover-sports.jpg";
import coverStrategy from "@/assets/cover-strategy.jpg";
import type { PlatformId } from "@/config/store";

export type ProductFormat = "physical" | "digital";

export type Product = {
  sku: string;
  title: string;
  platform: PlatformId;
  format: ProductFormat;
  price_minor: number;
  image_key: string;
  description: string;
  compatibility: string;
  genre: string;
  available: boolean;
  max_quantity: number;
  featured: boolean;
};

const COVERS: Record<string, string> = {
  action: coverAction,
  adventure: coverAdventure,
  horror: coverHorror,
  racing: coverRacing,
  rpg: coverRpg,
  shooter: coverShooter,
  sports: coverSports,
  strategy: coverStrategy,
};

export function coverFor(imageKey: string): string | undefined {
  return COVERS[imageKey];
}

export const FORMAT_LABEL: Record<ProductFormat, string> = {
  physical: "Physical disc",
  digital: "Digital code",
};

export function deliveryMethod(product: Product): string {
  return product.format === "physical"
    ? "Shipped to your address in Sweden"
    : "Download code shown after a real purchase";
}

export function sortProducts(products: Product[], sort: string): Product[] {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.price_minor - b.price_minor);
  else if (sort === "price-desc") list.sort((a, b) => b.price_minor - a.price_minor);
  else list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
}
