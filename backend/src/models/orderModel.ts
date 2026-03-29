import { prisma } from "../prisma";
import type { OrderWithItems } from "../types";

export async function fetchOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
