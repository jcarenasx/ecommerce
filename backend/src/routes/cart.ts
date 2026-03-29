import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../auth";
import { requireAuth } from "../middleware/requireAuth";
import { prisma } from "../prisma";
import type { CartItemWithProduct } from "../types";

const router = Router();

const addCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

type AddCartItemBody = z.infer<typeof addCartItemSchema>;
type UpdateCartItemBody = z.infer<typeof updateCartItemSchema>;
type ProductIdParams = {
  productId: string;
};
type ValidationDetails = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

type ErrorResponse = {
  error: string;
  details?: ValidationDetails;
};

type CartListResponse = {
  items: CartItemWithProduct[];
};

type CartItemResponse = {
  item: CartItemWithProduct;
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
    req: AuthedTypedRequest<Record<string, never>, CartListResponse>,
    res: Response<CartListResponse>
  ): Promise<Response<CartListResponse>> => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.auth!.userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return res.json({ items });
  }
);

router.post(
  "/",
  async (
    req: AuthedTypedRequest<Record<string, never>, CartItemResponse | ErrorResponse, AddCartItemBody>,
    res: Response<CartItemResponse | ErrorResponse>
  ): Promise<Response<CartItemResponse | ErrorResponse>> => {
  const parsed = addCartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  }

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: req.auth!.userId,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId: req.auth!.userId,
      productId,
      quantity,
    },
    include: { product: true },
  });

  return res.status(201).json({ item });
  }
);

router.put(
  "/:productId",
  async (
    req: AuthedTypedRequest<ProductIdParams, CartItemResponse | ErrorResponse, UpdateCartItemBody>,
    res: Response<CartItemResponse | ErrorResponse>
  ): Promise<Response<CartItemResponse | ErrorResponse>> => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
  }

  const parsed = updateCartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: req.auth!.userId,
        productId,
      },
    },
  });

  if (!existingItem) {
    return res.status(404).json({ error: "CART_ITEM_NOT_FOUND" });
  }

  const item = await prisma.cartItem.update({
    where: {
      userId_productId: {
        userId: req.auth!.userId,
        productId,
      },
    },
    data: {
      quantity: parsed.data.quantity,
    },
    include: { product: true },
  });

  return res.json({ item });
  }
);

router.delete(
  "/:productId",
  async (
    req: AuthedTypedRequest<ProductIdParams, undefined>,
    res: Response<undefined | ErrorResponse>
  ): Promise<Response<undefined | ErrorResponse>> => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: req.auth!.userId,
        productId,
      },
    },
  });

  if (!existingItem) {
    return res.status(404).json({ error: "CART_ITEM_NOT_FOUND" });
  }

  await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId: req.auth!.userId,
        productId,
      },
    },
  });

  return res.status(204).send();
  }
);

export default router;
