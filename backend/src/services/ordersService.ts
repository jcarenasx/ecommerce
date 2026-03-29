import { ServiceError } from "../utils/errors";
import { fetchCartItemsWithProducts } from "../repository/cartRepository";
import { createOrderWithItems, fetchOrdersForUser } from "../repository/orderRepository";
import type { CartItemWithProduct, OrderWithItems } from "../types";

export async function listOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return fetchOrdersForUser(userId);
}

export async function createOrderFromCart(userId: string): Promise<OrderWithItems> {
  const cartItems: CartItemWithProduct[] = await fetchCartItemsWithProducts(userId);

  if (cartItems.length === 0) {
    throw new ServiceError("EMPTY_CART", 400);
  }

  const totalCents = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.priceCents,
    0
  );

  return createOrderWithItems(userId, cartItems, totalCents);
}
