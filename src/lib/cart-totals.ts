import { SHIPPING_FEE_MINOR } from "@/config/store";
import type { Product } from "./catalogue";
import type { CartLine } from "./cart";

export type CartItem = {
  product: Product;
  quantity: number;
  lineTotalMinor: number;
};

export type CartTotals = {
  items: CartItem[];
  /** SKUs in localStorage that no longer exist in the catalogue. */
  missingSkus: string[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  requiresShipping: boolean;
  hasUnavailable: boolean;
};

/** Prices always come from the catalogue, never from localStorage. */
export function buildCart(lines: CartLine[], products: Product[]): CartTotals {
  const items: CartItem[] = [];
  const missingSkus: string[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.sku === line.sku);
    if (!product) {
      missingSkus.push(line.sku);
      continue;
    }
    const quantity = Math.max(1, Math.min(line.quantity, product.max_quantity));
    items.push({ product, quantity, lineTotalMinor: product.price_minor * quantity });
  }

  const subtotalMinor = items.reduce((sum, i) => sum + i.lineTotalMinor, 0);
  const requiresShipping = items.some((i) => i.product.format === "physical");
  const shippingMinor = requiresShipping ? SHIPPING_FEE_MINOR : 0;

  return {
    items,
    missingSkus,
    subtotalMinor,
    shippingMinor,
    totalMinor: subtotalMinor + shippingMinor,
    requiresShipping,
    hasUnavailable: items.some((i) => !i.product.available),
  };
}
