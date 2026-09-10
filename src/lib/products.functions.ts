import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "./catalogue";

/**
 * Public, read-only Supabase client. Products are readable by anonymous visitors
 * through a narrow row-level-security policy.
 */
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const COLUMNS =
  "sku, title, platform, format, price_minor, image_key, description, compatibility, genre, available, max_quantity, featured";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select(COLUMNS)
    .order("title", { ascending: true });

  if (error) throw new Error("Could not load the catalogue. Please try again.");
  return (data ?? []) as unknown as Product[];
});
