import { useState } from "react";
import type { FormEvent } from "react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { useProducts } from "../../hooks/useProducts";
import type { Product, ProductInput } from "../../types";

type ProductFormState = {
  name: string;
  priceCents: string;
  imageUrl: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  priceCents: "",
  imageUrl: "",
};

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

function mapFormToInput(state: ProductFormState): ProductInput {
  return {
    name: state.name.trim(),
    priceCents: Number(state.priceCents),
    imageUrl: state.imageUrl.trim() || null,
  };
}

export default function AdminProductsPage() {
  const { data: products = [], isLoading, isError, error } = useProducts();
  const { createProduct, editProduct, deleteProduct } = useAdminProducts();
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = (): void => {
    setEditingProductId(null);
    setFormState(EMPTY_FORM);
    setFormError(null);
  };

  const handleEdit = (product: Product): void => {
    setEditingProductId(product.id);
    setFormState({
      name: product.name,
      priceCents: String(product.priceCents),
      imageUrl: product.imageUrl ?? "",
    });
    setFormError(null);
  };

  const handleDelete = async (productId: number): Promise<void> => {
    try {
      await deleteProduct.mutateAsync(productId);
      if (editingProductId === productId) {
        resetForm();
      }
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el producto."
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const nextInput = mapFormToInput(formState);

    if (!nextInput.name) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (!Number.isInteger(nextInput.priceCents) || nextInput.priceCents < 0) {
      setFormError("El precio debe ser un entero positivo en centavos.");
      return;
    }

    try {
      if (editingProductId === null) {
        await createProduct.mutateAsync(nextInput);
      } else {
        await editProduct.mutateAsync({
          productId: editingProductId,
          input: nextInput,
        });
      }

      resetForm();
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo guardar el producto."
      );
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Administracion
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Productos
        </h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Gestiona el catalogo principal desde este panel sin exponer herramientas
          administrativas a la tienda publica.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.9fr)]">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-stone-900">Catalogo actual</h2>
          </div>

          {isLoading && (
            <p className="px-5 py-8 text-sm text-stone-600">Cargando productos...</p>
          )}

          {isError && (
            <p className="px-5 py-8 text-sm text-red-700">
              {error instanceof Error ? error.message : "No se pudieron cargar los productos."}
            </p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-stone-700">ID</th>
                    <th className="px-5 py-3 text-left font-semibold text-stone-700">Nombre</th>
                    <th className="px-5 py-3 text-left font-semibold text-stone-700">Precio</th>
                    <th className="px-5 py-3 text-left font-semibold text-stone-700">
                      Imagen
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-stone-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((product: Product) => (
                    <tr key={product.id} className="align-top">
                      <td className="px-5 py-4 text-stone-500">{product.id}</td>
                      <td className="px-5 py-4 font-medium text-stone-900">{product.name}</td>
                      <td className="px-5 py-4 text-stone-700">
                        {formatCurrency(product.priceCents)}
                      </td>
                      <td className="px-5 py-4 text-stone-500">
                        {product.imageUrl ? "Configurada" : "Sin imagen"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(product.id)}
                            disabled={deleteProduct.isPending}
                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {editingProductId === null ? "Crear producto" : "Editar producto"}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {editingProductId === null
                  ? "Agrega un nuevo producto al catalogo."
                  : `Estas editando el producto #${editingProductId}.`}
              </p>
            </div>
            {editingProductId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Cancelar
              </button>
            )}
          </div>

          <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Nombre</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) =>
                  setFormState((current: ProductFormState) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
                placeholder="Nombre del producto"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">
                Precio en centavos
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={formState.priceCents}
                onChange={(event) =>
                  setFormState((current: ProductFormState) => ({
                    ...current,
                    priceCents: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
                placeholder="1000"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">
                URL de imagen
              </span>
              <input
                type="url"
                value={formState.imageUrl}
                onChange={(event) =>
                  setFormState((current: ProductFormState) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
                placeholder="https://..."
              />
            </label>

            {formError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={createProduct.isPending || editProduct.isPending}
              className="w-full rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createProduct.isPending || editProduct.isPending
                ? "Guardando..."
                : editingProductId === null
                  ? "Crear producto"
                  : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
