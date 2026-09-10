import type { PlatformId } from "@/config/store";

export type ProductFormat = "physical" | "digital";

export type Product = {
  sku: string;
  title: string;
  platform: PlatformId;
  format: ProductFormat;
  price_minor: number;
  /** CDN path to this exact game's cover artwork. */
  cover_url: string;
  /** Where the cover artwork was sourced from (publisher store asset). */
  cover_source_url: string;
  /** Official store page the listing was verified against. */
  source_url: string;
  description: string;
  compatibility: string;
  genre: string;
  available: boolean;
  max_quantity: number;
  featured: boolean;
};

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
