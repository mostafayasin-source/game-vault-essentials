import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SHIPPING_FEE_MINOR, DELIVERY_COUNTRY } from "@/config/store";

const orderInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional().or(z.literal("")),
  streetAddress: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        sku: z.string().trim().min(1).max(64),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export type PlaceOrderInput = z.infer<typeof orderInputSchema>;

export type PlacedOrder = {
  orderReference: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  requiresShipping: boolean;
  address: { street: string; postalCode: string; city: string; country: string } | null;
  items: Array<{
    sku: string;
    title: string;
    platform: string;
    format: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
  }>;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  status: string;
};

function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `GV-${out}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderInputSchema.parse(data))
  .handler(async ({ data }): Promise<PlacedOrder> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Idempotency: a retry with the same key returns the order that already exists.
    const existing = await supabaseAdmin
      .from("orders")
      .select("id, order_reference")
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();

    if (existing.data) {
      return await loadOrder(supabaseAdmin, existing.data.order_reference);
    }

    // Authoritative product data comes from the database, never from the browser.
    const skus = [...new Set(data.items.map((i) => i.sku))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("sku, title, platform, format, price_minor, available, max_quantity")
      .in("sku", skus);

    if (productError) throw new Error("Could not verify the products in your cart.");

    const merged = new Map<string, number>();
    for (const item of data.items) {
      merged.set(item.sku, (merged.get(item.sku) ?? 0) + item.quantity);
    }

    const lines: PlacedOrder["items"] = [];
    let subtotal = 0;
    let requiresShipping = false;

    for (const [sku, quantity] of merged) {
      const product = products?.find((p) => p.sku === sku);
      if (!product) throw new Error(`One of the products is no longer available (${sku}).`);
      if (!product.available) throw new Error(`${product.title} is currently unavailable.`);
      if (quantity > product.max_quantity) {
        throw new Error(`Only ${product.max_quantity} copies of ${product.title} can be ordered.`);
      }
      const lineTotal = product.price_minor * quantity;
      subtotal += lineTotal;
      if (product.format === "physical") requiresShipping = true;
      lines.push({
        sku: product.sku,
        title: product.title,
        platform: product.platform,
        format: product.format,
        quantity,
        unitPriceMinor: product.price_minor,
        lineTotalMinor: lineTotal,
      });
    }

    if (requiresShipping) {
      const missing =
        !data.streetAddress?.trim() || !data.postalCode?.trim() || !data.city?.trim();
      if (missing) throw new Error("A Swedish delivery address is required for physical items.");
    }

    const shipping = requiresShipping ? SHIPPING_FEE_MINOR : 0;
    const total = subtotal + shipping;
    const reference = makeReference();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_reference: reference,
        idempotency_key: data.idempotencyKey,
        customer_name: data.customerName,
        customer_email: data.customerEmail.toLowerCase(),
        customer_phone: data.customerPhone?.trim() || null,
        street_address: requiresShipping ? data.streetAddress!.trim() : null,
        postal_code: requiresShipping ? data.postalCode!.trim() : null,
        city: requiresShipping ? data.city!.trim() : null,
        country: DELIVERY_COUNTRY,
        requires_shipping: requiresShipping,
        subtotal_minor: subtotal,
        shipping_minor: shipping,
        total_minor: total,
        status: "demo_placed",
      })
      .select("id, order_reference")
      .single();

    if (orderError || !order) {
      // A duplicate key means a retry raced us; return the stored order instead.
      if (orderError?.code === "23505") {
        const dup = await supabaseAdmin
          .from("orders")
          .select("order_reference")
          .eq("idempotency_key", data.idempotencyKey)
          .maybeSingle();
        if (dup.data) return await loadOrder(supabaseAdmin, dup.data.order_reference);
      }
      throw new Error("The order could not be saved. Please try again.");
    }

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        sku: line.sku,
        title: line.title,
        platform: line.platform,
        format: line.format,
        quantity: line.quantity,
        unit_price_minor: line.unitPriceMinor,
        line_total_minor: line.lineTotalMinor,
      })),
    );

    if (itemsError) {
      // Keep storage consistent: no order without its items.
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("The order could not be saved. Please try again.");
    }

    return await loadOrder(supabaseAdmin, order.order_reference);
  });

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function loadOrder(admin: AdminClient, reference: string): Promise<PlacedOrder> {
  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("order_reference", reference)
    .single();
  if (error || !order) throw new Error("The order could not be read back.");

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    orderReference: order.order_reference,
    createdAt: order.created_at,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    requiresShipping: order.requires_shipping,
    address: order.requires_shipping
      ? {
          street: order.street_address ?? "",
          postalCode: order.postal_code ?? "",
          city: order.city ?? "",
          country: order.country,
        }
      : null,
    items: (items ?? []).map((i) => ({
      sku: i.sku,
      title: i.title,
      platform: i.platform,
      format: i.format,
      quantity: i.quantity,
      unitPriceMinor: i.unit_price_minor,
      lineTotalMinor: i.line_total_minor,
    })),
    subtotalMinor: order.subtotal_minor,
    shippingMinor: order.shipping_minor,
    totalMinor: order.total_minor,
    status: order.status,
  };
}
