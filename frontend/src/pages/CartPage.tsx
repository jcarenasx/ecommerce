import { Link } from "react-router-dom";
import CartPanel from "../components/CartPanel";

export default function CartPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Carrito de compras
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Revisa tus productos antes de continuar al checkout.
          </p>
        </div>

        <Link
          to="/checkout"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Ir a checkout
        </Link>
      </div>

      <div className="max-w-md">
        <CartPanel />
      </div>
    </main>
  );
}
