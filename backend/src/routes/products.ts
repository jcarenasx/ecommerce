import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../auth";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import { prisma } from "../prisma";
import type { Product } from "../types";

const router = Router();

type ProductParams = {
  id: string;
};

type ErrorResponse = {
  error: string;
  details?: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
};

type ProductsListResponse = {
  products: Product[];
};

type ProductDetailResponse = {
  product: Product;
};

const productBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().trim().url().nullable().optional(),
});

type ProductBody = z.infer<typeof productBodySchema>;

type ProductMutationResponse = {
  product: Product;
};

type ProductMutationRequest<
  Params extends Record<string, string> = Record<string, never>
> = AuthedRequest & Request<Params, ProductMutationResponse | ErrorResponse, ProductBody>;

router.get(
  "/",
  async (
    _req: Request<Record<string, never>, ProductsListResponse, Record<string, never>>,
    res: Response<ProductsListResponse>
  ): Promise<Response<ProductsListResponse>> => {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return res.json({ products });
  }
);

router.get(
  "/:id",
  async (
    req: Request<ProductParams, ProductDetailResponse | ErrorResponse, Record<string, never>>,
    res: Response<ProductDetailResponse | ErrorResponse>
  ): Promise<Response<ProductDetailResponse | ErrorResponse>> => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  }

  return res.json({ product });
  }
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (
    req: ProductMutationRequest,
    res: Response<ProductMutationResponse | ErrorResponse>
  ): Promise<Response<ProductMutationResponse | ErrorResponse>> => {
    const parsed = productBodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_BODY",
        details: parsed.error.flatten(),
      });
    }

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        priceCents: parsed.data.priceCents,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });

    return res.status(201).json({ product });
  }
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (
    req: ProductMutationRequest<ProductParams>,
    res: Response<ProductMutationResponse | ErrorResponse>
  ): Promise<Response<ProductMutationResponse | ErrorResponse>> => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
    }

    const parsed = productBodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_BODY",
        details: parsed.error.flatten(),
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        priceCents: parsed.data.priceCents,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });

    return res.json({ product });
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (
    req: AuthedRequest & Request<ProductParams, undefined | ErrorResponse, Record<string, never>>,
    res: Response<undefined | ErrorResponse>
  ): Promise<Response<undefined | ErrorResponse>> => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(204).send();
  }
);

export default router;
