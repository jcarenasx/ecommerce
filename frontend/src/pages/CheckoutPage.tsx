import { Link } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useOrders } from "../hooks/useOrders";
import type { CartItem } from "../types";

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const { items } = useCart();
  const { createOrder } = useOrders();

  const total = items.reduce(
    (sum: number, item: CartItem) => sum + item.product.priceCents * item.quantity,
    0
  );

  const handleCheckout = async (): Promise<void> => {
    await createOrder.mutateAsync();
  };

  return (
    <>
      <main className="mx-auto min-h-[calc(100vh-4.5rem)] w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Confirma tu orden y procesa la compra desde esta pantalla.
        </p>

        <div
          className={`mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${
            !isAuthenticated ? "pointer-events-none opacity-40 blur-[1px]" : ""
          }`}
        >
          {items.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Tu carrito esta vacio.</p>
              <Link
                to="/home"
                className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Volver a productos
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((item: CartItem) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.product.name}</p>
                      <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.product.priceCents * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-base font-semibold text-slate-900">Total</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/cart"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Volver al carrito
                </Link>
                <button
                  type="button"
                  onClick={() => void handleCheckout()}
                  disabled={createOrder.isPending || !isAuthenticated}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createOrder.isPending ? "Procesando..." : "Confirmar compra"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {!isAuthenticated && (
        <AuthModal
          redirectTo="/home"
          title="Inicia sesion o registrate"
          description="Para completar el checkout necesitamos asociar la compra a tu cuenta."
        />
      )}
    </>
  );
}
