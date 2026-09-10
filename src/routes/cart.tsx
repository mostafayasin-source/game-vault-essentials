import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/CoverImage";
import { FormatLabel, PlatformLabel } from "@/components/Labels";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlocks";
import { formatPrice } from "@/config/store";
import { useCart } from "@/lib/cart";
import { buildCart } from "@/lib/cart-totals";
import { productsQueryOptions } from "@/lib/products-query";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — GameVault" },
      {
        name: "description",
        content: "Review the games in your GameVault cart, change quantities and continue to the demo checkout.",
      },
      { property: "og:title", content: "Your cart — GameVault" },
      { property: "og:description", content: "Review your GameVault demo cart before checkout." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="Your cart could not be loaded right now. Please refresh the page." />
    </div>
  ),
  component: CartPage,
});

function CartPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { lines, hydrated, setQuantity, remove } = useCart();
  const cart = buildCart(lines, products);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <LoadingBlock label="Loading your cart…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

      {cart.items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl surface-panel px-6 py-20 text-center">
          <ShoppingCart className="size-10 text-muted-foreground" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a game to get started — nothing is ever charged in this demo.
            </p>
          </div>
          <Button asChild>
            <Link to="/games">Browse games</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4">
            {cart.items.map(({ product, quantity, lineTotalMinor }) => (
              <li
                key={product.sku}
                className="flex gap-4 rounded-xl surface-panel p-4 sm:items-center"
              >
                <Link
                  to="/product/$sku"
                  params={{ sku: product.sku }}
                  className="w-20 shrink-0 sm:w-24"
                >
                  <CoverImage imageKey={product.image_key} title={product.title} />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    to="/product/$sku"
                    params={{ sku: product.sku }}
                    className="font-semibold hover:text-primary"
                  >
                    {product.title}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <PlatformLabel platform={product.platform} />
                    <FormatLabel format={product.format} />
                  </div>
                  {!product.available && (
                    <p className="text-xs text-destructive">
                      This edition is unavailable — remove it to check out.
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-md border border-input bg-surface p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        aria-label={`Decrease quantity of ${product.title}`}
                        onClick={() => setQuantity(product.sku, quantity - 1, product.max_quantity)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        aria-label={`Increase quantity of ${product.title}`}
                        disabled={quantity >= product.max_quantity}
                        onClick={() => setQuantity(product.sku, quantity + 1, product.max_quantity)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(product.sku)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold text-primary">{formatPrice(lineTotalMinor)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(product.price_minor)} each
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl surface-panel p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(cart.subtotalMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{cart.requiresShipping ? formatPrice(cart.shippingMinor) : "Free (digital)"}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd className="text-primary">{formatPrice(cart.totalMinor)}</dd>
              </div>
            </dl>

            <Button asChild size="lg" className="mt-5 w-full" disabled={cart.hasUnavailable}>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/games">Continue Shopping</Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo checkout: no money is charged and no games are dispatched or activated.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
