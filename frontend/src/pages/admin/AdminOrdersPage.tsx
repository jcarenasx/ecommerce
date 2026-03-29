import type { Order, OrderItem, OrderStatus } from "../../types";
import { useAdminOrders } from "../../hooks/useAdminOrders";

function formatCurrency(priceCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceCents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClasses(status: OrderStatus): string {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "COMPLETED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "PENDING":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function orderStatusText(status: OrderStatus): string {
  switch (status) {
    case "PAID":
      return "Pagado";
    case "SHIPPED":
      return "Enviado";
    case "COMPLETED":
      return "Completado";
    case "CANCELLED":
      return "Cancelado";
    case "PENDING":
    default:
      return "Pendiente";
  }
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading, isError, error, updateStatus } = useAdminOrders();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Administracion
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Ordenes
        </h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Revisa las ordenes creadas por los usuarios y el snapshot de productos
          guardado en cada compra.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-900">Historial de ordenes</h2>
        </div>

        {isLoading && (
          <p className="px-5 py-8 text-sm text-stone-600">Cargando ordenes...</p>
        )}

        {isError && (
          <p className="px-5 py-8 text-sm text-red-700">
            {error instanceof Error ? error.message : "No se pudieron cargar las ordenes."}
          </p>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <p className="px-5 py-8 text-sm text-stone-600">
            Todavia no hay ordenes registradas.
          </p>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="divide-y divide-stone-200">
            {orders.map((order: Order) => (
              <article key={order.id} className="px-5 py-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Order ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-stone-900">
                      {order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      User ID
                    </p>
                    <p className="mt-1 break-all text-sm text-stone-700">{order.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">
                      {formatCurrency(order.totalCents)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Estado
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(order.status)}`}
                      >
                        {orderStatusText(order.status)}
                      </span>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateStatus.mutate({
                            orderId: order.id,
                            status: event.target.value as OrderStatus,
                          })
                        }
                        className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Fecha
                    </p>
                    <p className="mt-1 text-sm text-stone-700">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Contacto
                    </p>
                    <p className="mt-1 break-all text-sm text-stone-700">
                      {order.user?.email ?? "Sin email"}
                    </p>
                    {order.user?.phone ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`https://wa.me/${order.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hola, soy el admin. Tu pedido #${order.id} está ${orderStatusText(order.status)}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          Contactar
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus.mutate({
                              orderId: order.id,
                              status: "CANCELLED",
                            })
                          }
                          className="inline-flex rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <p className="text-xs text-stone-500">Sin telefono disponible</p>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus.mutate({
                              orderId: order.id,
                              status: "CANCELLED",
                            })
                          }
                          className="inline-flex rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">
                          Precio
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {order.items.map((item: OrderItem) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-stone-900">{item.name}</td>
                          <td className="px-4 py-3 text-stone-700">
                            {formatCurrency(item.priceCents)}
                          </td>
                          <td className="px-4 py-3 text-stone-700">{item.quantity}</td>
                          <td className="px-4 py-3 font-medium text-stone-900">
                            {formatCurrency(item.priceCents * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
