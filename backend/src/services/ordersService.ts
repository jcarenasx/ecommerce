import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { ServiceError } from "../utils/errors";
import { fetchCartItemsWithProducts } from "../models/cartModel";
import { fetchOrdersForUser } from "../models/orderModel";
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

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalCents,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            priceCents: item.product.priceCents,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { userId } });

    return createdOrder;
  });

  return order;
}
