import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../types";

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

export default function Home() {
  const { data: products = [], isLoading, isError, error } = useProducts();

  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Tienda
      </h1>

      {isLoading && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Cargando productos...
        </p>
      )}

      {isError && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof Error ? error.message : "No se pudieron cargar productos."}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product: Product) => (
            <div
              key={product.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-lg font-semibold text-slate-900">{product.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                Precio: {formatCurrency(product.priceCents)}
              </p>
              <div className="mt-4">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
