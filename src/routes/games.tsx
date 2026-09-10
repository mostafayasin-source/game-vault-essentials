import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CatalogueView } from "@/components/CatalogueView";
import { ErrorBlock } from "@/components/StateBlocks";
import { productsQueryOptions } from "@/lib/products-query";

type GamesSearch = { q?: string | undefined };

export const Route = createFileRoute("/games")({
  validateSearch: (search: { q?: string | undefined }): GamesSearch => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "All games — GameVault demo catalogue" },
      {
        name: "description",
        content:
          "Browse every demo listing in the GameVault catalogue: PlayStation 5, Xbox Series X|S and PC games with prices in kronor.",
      },
      { property: "og:title", content: "All games — GameVault" },
      {
        property: "og:description",
        content: "Search, filter and sort the full GameVault demo catalogue.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="The catalogue could not be loaded right now. Please refresh the page." />
    </div>
  ),
  component: GamesPage,
});

function GamesPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { q } = Route.useSearch();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">All games</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every listing below is demo content. Titles, stock and prices are fictional and nothing is
        ever charged or dispatched.
      </p>
      <div className="mt-8">
        <CatalogueView products={products} initialSearch={q ?? ""} />
      </div>
    </div>
  );
}
