import * as React from "react";

/** Only SKUs and quantities are stored locally — never prices or customer data. */
const STORAGE_KEY = "gamevault_cart_v1";

export type CartLine = { sku: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  totalItems: number;
  hydrated: boolean;
  quantityOf: (sku: string) => number;
  add: (sku: string, quantity?: number, max?: number) => void;
  setQuantity: (sku: string, quantity: number, max?: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          typeof l === "object" &&
          l !== null &&
          typeof (l as CartLine).sku === "string" &&
          Number.isInteger((l as CartLine).quantity) &&
          (l as CartLine).quantity > 0,
      )
      .map((l) => ({ sku: l.sku, quantity: l.quantity }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setLines(read());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — the cart still works for this session */
    }
  }, [lines, hydrated]);

  const value = React.useMemo<CartContextValue>(() => {
    const clamp = (n: number, max = 10) => Math.max(1, Math.min(Math.floor(n), max));
    return {
      lines,
      hydrated,
      totalItems: lines.reduce((sum, l) => sum + l.quantity, 0),
      quantityOf: (sku) => lines.find((l) => l.sku === sku)?.quantity ?? 0,
      add: (sku, quantity = 1, max = 10) =>
        setLines((prev) => {
          const found = prev.find((l) => l.sku === sku);
          if (!found) return [...prev, { sku, quantity: clamp(quantity, max) }];
          return prev.map((l) =>
            l.sku === sku ? { ...l, quantity: clamp(l.quantity + quantity, max) } : l,
          );
        }),
      setQuantity: (sku, quantity, max = 10) =>
        setLines((prev) =>
          quantity < 1
            ? prev.filter((l) => l.sku !== sku)
            : prev.map((l) => (l.sku === sku ? { ...l, quantity: clamp(quantity, max) } : l)),
        ),
      remove: (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku)),
      clear: () => setLines([]),
    };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
