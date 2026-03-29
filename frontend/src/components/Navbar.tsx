import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import type { CartItem } from "../types";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const totalItems = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <Link to="/home" className="m-0 text-xl font-semibold text-slate-900">
            Ecommerce Store
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            {isAuthenticated ? `Sesion: ${user?.email}` : "Sin sesion"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ir al carrito
          </Link>
          <div
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            aria-live="polite"
          >
            Cart: {totalItems} item(s)
          </div>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </Link>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
