import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import type { CartItem } from "../types";

function lineImageSrc(item: CartItem): string {
  if (item.product.imageUrl) return item.product.imageUrl;
  return `https://placehold.co/96x96/e2e8f0/64748b?text=${encodeURIComponent(String(item.id))}`;
}

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

export default function CartPanel() {
  const navigate = useNavigate();
  const { items: cart, addItem, updateItem, removeItem } = useCart();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0) {
      startTransition(() => {
        setCheckoutMessage(null);
      });
    }
  }, [cart.length]);

  const subtotal = cart.reduce(
    (sum: number, item: CartItem) => sum + item.product.priceCents * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutMessage(null);
    navigate("/checkout");
  };

  return (
    <aside className="flex w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:min-w-[min(100%,20rem)] lg:max-w-md">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Your cart
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {cart.length === 0
            ? "Add items from the store"
            : `${cart.reduce((n: number, i: CartItem) => n + i.quantity, 0)} items`}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {cart.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-slate-600">
            Your cart is empty.
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.map((item: CartItem) => {
              const lineTotal = item.product.priceCents * item.quantity;
              return (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <img
                    src={lineImageSrc(item)}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-md border border-slate-200 bg-white object-cover"
                    width={80}
                    height={80}
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-slate-900">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {formatCurrency(item.product.priceCents)} each
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            item.quantity === 1
                              ? removeItem.mutate(item.productId)
                              : updateItem.mutate({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                })
                          }
                          className="px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] border-x border-slate-200 px-2 py-1.5 text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            addItem.mutate({
                              product: item.product,
                              quantity: 1,
                            })
                          }
                          className="px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(item.productId)}
                        className="text-sm font-medium text-red-600 underline-offset-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 text-right text-sm font-semibold text-slate-900">
                      Line: {formatCurrency(lineTotal)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <dt>Subtotal</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>Shipping</dt>
            <dd className="font-medium text-slate-900">Free</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>

        {checkoutMessage && (
          <p
            className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            {checkoutMessage}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={cart.length === 0}
            className="order-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
          >
            Checkout
          </button>
        </div>
      </div>
    </aside>
  );
}
