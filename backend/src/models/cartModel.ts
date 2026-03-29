import { prisma } from "../prisma";
import type { CartItemWithProduct } from "../types";

export async function fetchCartItemsWithProducts(userId: string): Promise<CartItemWithProduct[]> {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
}

export async function clearCartForUser(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
