import { useCart } from "../hooks/useCart";
import type { Product } from "../types";

interface ProductProps {
  product: Product;
}

function cardImageSrc(product: ProductProps["product"]): string {
  if (product.imageUrl) return product.imageUrl;
  return `https://placehold.co/400x240/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;
}

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

export default function ProductCard({ product }: ProductProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem.mutate({ product, quantity: 1 });
  };

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img
        src={cardImageSrc(product)}
        alt=""
        className="aspect-[5/3] w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-1 text-slate-600">{formatCurrency(product.priceCents)}</p>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {addItem.isPending ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
