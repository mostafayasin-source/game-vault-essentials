import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Disc3, Download } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ErrorBlock } from "@/components/StateBlocks";
import { PLATFORMS, STORE_TAGLINE, formatPrice, SHIPPING_FEE_MINOR } from "@/config/store";
import { productsQueryOptions } from "@/lib/products-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GameVault — Games for PS5, Xbox Series X|S and PC" },
      {
        name: "description",
        content:
          "GameVault is a demo game store with physical and digital titles for PlayStation 5, Xbox Series X|S and PC. Prices in kronor.",
      },
      { property: "og:title", content: "GameVault — Your next adventure starts here" },
      {
        property: "og:description",
        content: "Demo store with games for PlayStation 5, Xbox Series X|S and PC.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="The catalogue could not be loaded right now. Please refresh the page." />
    </div>
  ),
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  // Featured selection spans all three platforms.
  const featured = ["ps5", "xbox", "pc"]
    .flatMap((platform) => products.filter((p) => p.featured && p.platform === platform).slice(0, 3))
    .slice(0, 9);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 hero-fade" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/30">
            Demo store
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {STORE_TAGLINE}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover games for PlayStation 5, Xbox Series X|S, and PC.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base glow-ring">
            <Link to="/games">Explore Games</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="platforms">
        <h2 id="platforms" className="text-2xl font-bold tracking-tight">
          Shop by platform
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const sample = products.find(
              (p) => p.platform === platform.id && p.featured && p.cover_url,
            );
            const art = sample?.cover_url;
            return (
              <Link
                key={platform.id}
                to="/platform/$platform"
                params={{ platform: platform.slug }}
                className="group relative isolate flex h-48 flex-col justify-end overflow-hidden rounded-xl surface-panel p-5 transition-shadow duration-300 hover:glow-ring"
              >
                {art && (
                  <img
                    src={art}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                )}
                <div className="absolute inset-0 -z-10 hero-fade" aria-hidden="true" />
                <h3 className={`text-xl font-bold ${platform.accentClass}`}>{platform.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{platform.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6" aria-labelledby="featured">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured" className="text-2xl font-bold tracking-tight">
            Featured games
          </h2>
          <Link to="/games" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="delivery">
        <h2 id="delivery" className="text-2xl font-bold tracking-tight">
          How delivery works
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl surface-panel p-6">
            <Disc3 className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold">Physical discs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Boxed games are shipped within Sweden for a flat{" "}
              {formatPrice(SHIPPING_FEE_MINOR)} per order. Disc games need a console with a disc
              drive.
            </p>
          </div>
          <div className="rounded-xl surface-panel p-6">
            <Download className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold">Digital codes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Digital titles carry no shipping fee. In this demo no code is ever generated,
              dispatched or activated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
