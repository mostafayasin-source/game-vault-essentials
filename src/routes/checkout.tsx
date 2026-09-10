import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverImage } from "@/components/CoverImage";
import { FormatLabel, PlatformLabel } from "@/components/Labels";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlocks";
import { DELIVERY_COUNTRY, formatPrice } from "@/config/store";
import { useCart } from "@/lib/cart";
import { buildCart } from "@/lib/cart-totals";
import { productsQueryOptions } from "@/lib/products-query";
import { placeOrder, type PlacedOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GameVault demo order" },
      {
        name: "description",
        content:
          "Guest checkout for the GameVault demo store. Enter your details and place a demo order — nothing is charged.",
      },
      { property: "og:title", content: "Checkout — GameVault" },
      { property: "og:description", content: "Guest demo checkout at GameVault." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <ErrorBlock message="Checkout could not be loaded right now. Please refresh the page." />
    </div>
  ),
  component: CheckoutPage,
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  street: "",
  postalCode: "",
  city: "",
};

function CheckoutPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { lines, hydrated, clear } = useCart();
  const submit = useServerFn(placeOrder);

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [failure, setFailure] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<PlacedOrder | null>(null);
  // One key per checkout attempt: a retry never creates a second order.
  const idempotencyKey = React.useRef<string>("");
  if (!idempotencyKey.current && typeof crypto !== "undefined") {
    idempotencyKey.current = crypto.randomUUID();
  }

  const cart = buildCart(lines, products);

  if (order) return <Confirmation order={order} />;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <LoadingBlock label="Loading checkout…" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl surface-panel px-6 py-20 text-center">
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">
            Add at least one game before placing a demo order.
          </p>
          <Button asChild>
            <Link to="/games">Browse games</Link>
          </Button>
        </div>
      </div>
    );
  }

  const physicalItems = cart.items.filter((i) => i.product.format === "physical");
  const digitalItems = cart.items.filter((i) => i.product.format === "digital");

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address, for example name@example.com.";
    if (cart.requiresShipping) {
      if (!form.street.trim()) next.street = "Enter your street address.";
      if (!/^\d{3}\s?\d{2}$/.test(form.postalCode.trim()))
        next.postalCode = "Enter a Swedish postal code, for example 123 45.";
      if (!form.city.trim()) next.city = "Enter your city.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFailure(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await submit({
        data: {
          idempotencyKey: idempotencyKey.current,
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          streetAddress: form.street.trim(),
          postalCode: form.postalCode.trim(),
          city: form.city.trim(),
          items: cart.items.map((i) => ({ sku: i.product.sku, quantity: i.quantity })),
        },
      });
      // Success only after the backend confirms the order was saved.
      setOrder(result);
      clear();
    } catch (error) {
      setFailure(
        error instanceof Error && error.message
          ? error.message
          : "The order could not be saved. Your cart and details have been kept — please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Guest checkout — no account needed. This is a demo store: no money is charged and no games
        are dispatched or activated.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl surface-panel p-5">
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We save your email so we can contact you about this order. We never publish it.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Full name"
                value={form.name}
                error={errors.name}
                autoComplete="name"
                onChange={(v) => update("name", v)}
                required
              />
              <Field
                id="email"
                label="Email address"
                type="email"
                value={form.email}
                error={errors.email}
                autoComplete="email"
                onChange={(v) => update("email", v)}
                required
              />
              <Field
                id="phone"
                label="Phone number (optional)"
                type="tel"
                value={form.phone}
                autoComplete="tel"
                onChange={(v) => update("phone", v)}
              />
            </div>
          </section>

          {cart.requiresShipping ? (
            <section className="rounded-xl surface-panel p-5">
              <h2 className="text-lg font-semibold">Delivery address</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Required because your order contains physical discs. We deliver within{" "}
                {DELIVERY_COUNTRY}.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    id="street"
                    label="Street address"
                    value={form.street}
                    error={errors.street}
                    autoComplete="street-address"
                    onChange={(v) => update("street", v)}
                    required
                  />
                </div>
                <Field
                  id="postalCode"
                  label="Postal code"
                  value={form.postalCode}
                  error={errors.postalCode}
                  autoComplete="postal-code"
                  onChange={(v) => update("postalCode", v)}
                  required
                />
                <Field
                  id="city"
                  label="City"
                  value={form.city}
                  error={errors.city}
                  autoComplete="address-level2"
                  onChange={(v) => update("city", v)}
                  required
                />
                <div className="sm:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={DELIVERY_COUNTRY}
                    readOnly
                    className="mt-1.5 h-11 bg-surface text-muted-foreground"
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl surface-panel p-5">
              <h2 className="text-lg font-semibold">Delivery</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your order contains digital codes only, so no address is needed and no shipping is
                charged.
              </p>
            </section>
          )}

          <section className="rounded-xl surface-panel p-5">
            <h2 className="text-lg font-semibold">Order review</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Need a change?{" "}
              <Link to="/cart" className="text-primary hover:underline">
                Edit your cart
              </Link>
              .
            </p>

            {physicalItems.length > 0 && (
              <ReviewGroup title="Physical discs — shipped" items={physicalItems} />
            )}
            {digitalItems.length > 0 && (
              <ReviewGroup title="Digital codes — no shipping" items={digitalItems} />
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl surface-panel p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(cart.subtotalMinor)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {cart.requiresShipping ? "Delivery (once per order)" : "Delivery"}
              </dt>
              <dd>{cart.requiresShipping ? formatPrice(cart.shippingMinor) : "Free"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="text-primary">{formatPrice(cart.totalMinor)}</dd>
            </div>
          </dl>

          {failure && (
            <p
              role="alert"
              className="mt-4 flex gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{failure}</span>
            </p>
          )}

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Saving your order…" : "Place Demo Order"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            No money will be charged, and no games will actually be dispatched or activated. Your
            order is saved so the team can review it.
          </p>
        </aside>
      </form>
    </div>
  );
}

function ReviewGroup({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof buildCart>["items"];
}) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {items.map(({ product, quantity, lineTotalMinor }) => (
          <li key={product.sku} className="flex items-center gap-3">
            <div className="w-12 shrink-0">
              <CoverImage imageKey={product.image_key} title={product.title} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.title}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <PlatformLabel platform={product.platform} />
                <FormatLabel format={product.format} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">× {quantity}</span>
            <span className="w-24 text-right text-sm font-semibold">
              {formatPrice(lineTotalMinor)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 bg-surface"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Confirmation({ order }: { order: PlacedOrder }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-xl surface-panel p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Demo order saved</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks {order.customerName}. Your order is stored in our system. No money was charged and
          no games will be dispatched or activated.
        </p>

        <dl className="mt-6 grid gap-4 rounded-lg bg-background/50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Order reference
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold text-primary">
              {order.orderReference}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Contact email</dt>
            <dd className="mt-1">{order.customerEmail}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</dt>
            <dd className="mt-1">
              {order.address
                ? `${order.address.street}, ${order.address.postalCode} ${order.address.city}, ${order.address.country}`
                : "Digital codes only — no delivery address needed."}
            </dd>
          </div>
        </dl>

        <ul className="mt-6 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.sku} className="flex items-center gap-3 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <PlatformLabel platform={item.platform} />
                  <FormatLabel format={item.format} />
                </div>
              </div>
              <span className="text-muted-foreground">× {item.quantity}</span>
              <span className="w-24 text-right font-semibold">
                {formatPrice(item.lineTotalMinor)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(order.subtotalMinor)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{order.shippingMinor > 0 ? formatPrice(order.shippingMinor) : "Free"}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="text-primary">{formatPrice(order.totalMinor)}</dd>
          </div>
        </dl>

        <Button asChild className="mt-6">
          <Link to="/games">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
