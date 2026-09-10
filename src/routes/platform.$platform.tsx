import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CatalogueView } from "@/components/CatalogueView";
import { ErrorBlock } from "@/components/StateBlocks";
import { getPlatform } from "@/config/store";
import { productsQueryOptions } from "@/lib/products-query";

export const Route = createFileRoute("/platform/$platform")({
  head: ({ params }) => {
    const info = getPlatform(params.platform);
    const name = info?.name ?? "Platform";
    return {
      meta: [
        { title: `${name} games — GameVault demo store` },
        {
          name: "description",
          content: `Demo listings for ${name}: physical and digital games with prices in kronor and clear compatibility notes.`,
        },
        { property: "og:title", content: `${name} games — GameVault` },
        {
          property: "og:description",
          content: `Browse the GameVault demo catalogue for ${name}.`,
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!getPlatform(params.platform)) throw notFound();
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="This category could not be loaded right now. Please refresh the page." />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Unknown platform</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We only stock PlayStation 5, Xbox Series X|S and PC games.
      </p>
      <Button asChild className="mt-6">
        <Link to="/games">Browse all games</Link>
      </Button>
    </div>
  ),
  component: PlatformPage,
});

function PlatformPage() {
  const { platform } = Route.useParams();
  const info = getPlatform(platform)!;
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const list = products.filter((p) => p.platform === info.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className={`text-3xl font-bold tracking-tight ${info.accentClass}`}>{info.name}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {info.blurb} All listings are demo content — prices and availability are fictional.
      </p>
      <div className="mt-8">
        <CatalogueView products={list} />
      </div>
    </div>
  );
}
