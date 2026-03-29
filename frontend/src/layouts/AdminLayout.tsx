import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-stone-950 px-6 py-8 text-stone-100 lg:block">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
            Admin Panel
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Ecommerce Admin</h1>
          <nav className="mt-10 flex flex-col gap-2">
            <Link
              to="/admin/products"
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Productos
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Ordenes
            </Link>
          </nav>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
              {user?.role}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-4 rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-stone-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Admin
                </p>
                <h1 className="text-lg font-semibold text-stone-900">Productos</h1>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Cerrar sesion
              </button>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
