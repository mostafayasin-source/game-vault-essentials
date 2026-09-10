import * as React from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/catalogue";
import { sortProducts } from "@/lib/catalogue";

type Props = {
  products: Product[];
  initialSearch?: string;
};

const selectClass =
  "h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CatalogueView({ products, initialSearch = "" }: Props) {
  const [search, setSearch] = React.useState(initialSearch);
  const [genre, setGenre] = React.useState("all");
  const [format, setFormat] = React.useState("all");
  const [sort, setSort] = React.useState("title");

  React.useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const genres = React.useMemo(
    () => [...new Set(products.map((p) => p.genre))].sort(),
    [products],
  );

  const results = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (!term || p.title.toLowerCase().includes(term)) &&
        (genre === "all" || p.genre === genre) &&
        (format === "all" || p.format === format),
    );
    return sortProducts(filtered, sort);
  }, [products, search, genre, format, sort]);

  const filtersActive = search.trim() !== "" || genre !== "all" || format !== "all";

  function clearFilters() {
    setSearch("");
    setGenre("all");
    setFormat("all");
    setSort("title");
  }

  return (
    <div>
      <div className="grid gap-4 rounded-xl surface-panel p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="catalogue-search" className="mb-1.5 block text-xs text-muted-foreground">
            Search by title
          </Label>
          <Input
            id="catalogue-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Nebula"
            className="h-11 bg-surface"
          />
        </div>
        <div>
          <Label htmlFor="catalogue-genre" className="mb-1.5 block text-xs text-muted-foreground">
            Genre
          </Label>
          <select
            id="catalogue-genre"
            className={selectClass}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="all">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="catalogue-format" className="mb-1.5 block text-xs text-muted-foreground">
            Format
          </Label>
          <select
            id="catalogue-format"
            className={selectClass}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="all">All formats</option>
            <option value="physical">Physical disc</option>
            <option value="digital">Digital code</option>
          </select>
        </div>
        <div>
          <Label htmlFor="catalogue-sort" className="mb-1.5 block text-xs text-muted-foreground">
            Sort
          </Label>
          <select
            id="catalogue-sort"
            className={selectClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="title">Title A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "game" : "games"}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl surface-panel px-6 py-16 text-center">
          <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">No games match your filters</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different title, genre or format.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}

      {filtersActive && results.length > 0 && (
        <div className="mt-6">
          <Button type="button" variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
