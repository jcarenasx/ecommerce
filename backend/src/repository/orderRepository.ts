import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import type { CartItemWithProduct, OrderWithItems } from "../types";

export async function fetchOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrderWithItems(
  userId: string,
  cartItems: CartItemWithProduct[],
  totalCents: number
): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
}
