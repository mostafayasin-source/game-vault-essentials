import { Link } from "@tanstack/react-router";
import { PLATFORMS, STORE_NAME } from "@/config/store";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
            Game<span className="text-primary">Vault</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {STORE_NAME} is a student demo store. All games, prices and stock are fictional and
            no purchase is ever charged.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h2 className="mb-3 font-semibold text-foreground">Shop</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="text-muted-foreground hover:text-primary">
                  All games
                </Link>
              </li>
              {PLATFORMS.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/platform/$platform"
                    params={{ platform: p.slug }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-semibold text-foreground">Your order</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-muted-foreground hover:text-primary">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Demo content only — no money is charged and no games are dispatched or activated.
      </div>
    </footer>
  );
}
