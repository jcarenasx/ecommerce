import { Router } from "express";
import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import type { AuthedRequest } from "../auth";
import { requireAuth } from "../middleware/requireAuth";
import { prisma } from "../prisma";
import type { CartItemWithProduct, OrderWithItems } from "../types";

const router = Router();

type ErrorResponse = {
  error: string;
};

type OrdersListResponse = {
  orders: OrderWithItems[];
};

type OrderResponse = {
  order: OrderWithItems;
};

type AuthedTypedRequest<
  Params extends Record<string, string> = Record<string, never>,
  ResBody = unknown,
  ReqBody = Record<string, never>
> = AuthedRequest & Request<Params, ResBody, ReqBody>;

router.use(requireAuth);

router.get(
  "/",
  async (
    req: AuthedTypedRequest<Record<string, never>, OrdersListResponse>,
    res: Response<OrdersListResponse>
  ): Promise<Response<OrdersListResponse>> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.auth!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ orders });
  }
);

router.post(
  "/",
  async (
    req: AuthedTypedRequest<Record<string, never>, OrderResponse | ErrorResponse>,
    res: Response<OrderResponse | ErrorResponse>
  ): Promise<Response<OrderResponse | ErrorResponse>> => {
  const userId = req.auth!.userId;

  const cartItems: CartItemWithProduct[] = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "EMPTY_CART" });
  }

  const totalCents = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) =>
      sum + item.quantity * item.product.priceCents,
    0
  );

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalCents,
        items: {
          create: cartItems.map((item: CartItemWithProduct) => ({
            productId: item.productId,
            name: item.product.name,
            priceCents: item.product.priceCents,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return createdOrder;
  });

  return res.status(201).json({ order });
  }
);

export default router;
