import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/CoverImage";
import { FormatLabel, PlatformLabel } from "@/components/Labels";
import { ErrorBlock } from "@/components/StateBlocks";
import { formatPrice, getPlatform } from "@/config/store";
import { deliveryMethod } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { productsQueryOptions } from "@/lib/products-query";

export const Route = createFileRoute("/product/$sku")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.sku} — GameVault demo listing` },
      {
        name: "description",
        content:
          "Demo product listing at GameVault with price, format, compatibility and delivery details.",
      },
      { property: "og:title", content: "GameVault demo listing" },
      {
        property: "og:description",
        content: "Price, format, compatibility and delivery details for this demo listing.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="This product could not be loaded right now. Please refresh the page." />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This listing is no longer available.</p>
      <Button asChild className="mt-6">
        <Link to="/games">Browse all games</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { sku } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const product = products.find((p) => p.sku === sku);
  const { add } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  if (!product) throw notFound();

  const platform = getPlatform(product.platform);
  const variants = products.filter((p) => p.title === product.title && p.sku !== product.sku);
  const max = product.max_quantity;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/games" className="hover:text-primary">
          All games
        </Link>
        <span className="px-2">/</span>
        {platform && (
          <>
            <Link
              to="/platform/$platform"
              params={{ platform: platform.slug }}
              className="hover:text-primary"
            >
              {platform.name}
            </Link>
            <span className="px-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <CoverImage
          coverUrl={product.cover_url}
          title={product.title}
          platformName={platform?.name}
          priority
        />

        <div>
          <div className="flex flex-wrap gap-2">
            <PlatformLabel platform={product.platform} />
            <FormatLabel format={product.format} />
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
              {product.genre}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">SKU {product.sku} · demo listing</p>

          <p className="mt-5 text-3xl font-bold text-primary">
            {formatPrice(product.price_minor)}
          </p>

          <p
            className={`mt-2 inline-flex items-center gap-1.5 text-sm ${
              product.available ? "text-success" : "text-destructive"
            }`}
          >
            {product.available ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <X className="size-4" aria-hidden="true" />
            )}
            {product.available ? "In stock" : "Currently unavailable"}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="mt-6 grid gap-4 rounded-xl surface-panel p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Compatibility
              </dt>
              <dd className="mt-1">{product.compatibility}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</dt>
              <dd className="mt-1">{deliveryMethod(product)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-md border border-input bg-surface p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label="Increase quantity"
                disabled={quantity >= max}
                onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button
              type="button"
              size="lg"
              className="h-12 px-8"
              disabled={!product.available}
              onClick={() => {
                add(product.sku, quantity, max);
                toast.success(`${product.title} added to cart`);
              }}
            >
              {product.available ? "Add to Cart" : "Unavailable"}
            </Button>
          </div>

          {variants.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold">Other editions</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <li key={v.sku}>
                    <Link
                      to="/product/$sku"
                      params={{ sku: v.sku }}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs transition-colors hover:border-primary hover:text-primary"
                    >
                      {getPlatform(v.platform)?.shortName} ·{" "}
                      {v.format === "physical" ? "Disc" : "Digital"} ·{" "}
                      {formatPrice(v.price_minor)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
