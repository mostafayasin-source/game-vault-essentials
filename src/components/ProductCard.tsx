import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/CoverImage";
import { FormatLabel, PlatformLabel } from "@/components/Labels";
import { formatPrice } from "@/config/store";
import type { Product } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl surface-panel transition-shadow duration-300 hover:glow-ring">
      <Link
        to="/product/$sku"
        params={{ sku: product.sku }}
        className="block"
        aria-label={`View ${product.title} for ${product.platform}`}
      >
        <CoverImage coverUrl={product.cover_url} title={product.title} className="rounded-none" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          <PlatformLabel platform={product.platform} />
          <FormatLabel format={product.format} />
        </div>

        <h3 className="text-base font-semibold leading-snug">
          <Link
            to="/product/$sku"
            params={{ sku: product.sku }}
            className="hover:text-primary focus-visible:text-primary"
          >
            {product.title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">{product.genre}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price_minor)}
          </span>
          <Button
            type="button"
            disabled={!product.available}
            onClick={() => {
              add(product.sku, 1, product.max_quantity);
              toast.success(`${product.title} added to cart`);
            }}
          >
            {product.available ? "Add to Cart" : "Unavailable"}
          </Button>
        </div>
      </div>
    </article>
  );
}
