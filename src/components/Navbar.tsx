import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLATFORMS } from "@/config/store";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const navigate = useNavigate();
  const { totalItems, hydrated } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ to: "/games", search: { q: term.trim() } });
  }

  const linkClass = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0 text-lg font-bold tracking-tight sm:text-xl">
          Game<span className="text-primary">Vault</span>
        </Link>

        <nav aria-label="Platforms" className="ml-4 hidden items-center gap-1 lg:flex">
          <Link to="/games" className={linkClass(pathname === "/games")}>
            All games
          </Link>
          {PLATFORMS.map((p) => (
            <Link
              key={p.id}
              to="/platform/$platform"
              params={{ platform: p.slug }}
              className={linkClass(pathname === `/platform/${p.slug}`)}
            >
              {p.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} role="search" className="ml-auto hidden md:block">
          <label htmlFor="nav-search" className="sr-only">
            Search games by title
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="nav-search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search games"
              className="h-10 w-52 bg-surface pl-9 lg:w-64"
            />
          </div>
        </form>

        <Link
          to="/cart"
          aria-label={`Cart, ${hydrated ? totalItems : 0} items`}
          className="relative ml-auto inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary md:ml-2"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          {hydrated && totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-surface px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} role="search" className="mb-3 md:hidden">
            <label htmlFor="mobile-search" className="sr-only">
              Search games by title
            </label>
            <Input
              id="mobile-search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search games"
              className="h-11 bg-background"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            <Link to="/games" className={linkClass(pathname === "/games")}>
              All games
            </Link>
            {PLATFORMS.map((p) => (
              <Link
                key={p.id}
                to="/platform/$platform"
                params={{ platform: p.slug }}
                className={linkClass(pathname === `/platform/${p.slug}`)}
              >
                {p.name}
              </Link>
            ))}
            <Link to="/cart" className={linkClass(pathname === "/cart")}>
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
