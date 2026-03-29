import type { Request, Response } from "express";
import { z } from "zod";
import { ServiceError } from "../utils/errors";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/productsService";
import type { Product } from "../types";

const productBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().trim().url().nullable().optional(),
});

type ProductBody = z.infer<typeof productBodySchema>;

type ValidationDetails = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

type ErrorResponse = {
  error: string;
  details?: ValidationDetails;
};

type ProductsListResponse = {
  products: Product[];
};

type ProductDetailResponse = {
  product: Product;
};

type ProductMutationResponse = {
  product: Product;
};

type ProductMutationRequest<Params extends Record<string, string> = Record<string, never>> =
  Request<Params, ProductMutationResponse | ErrorResponse, ProductBody>;

function handleServiceError<SuccessType>(
  res: Response<ErrorResponse | SuccessType>,
  error: unknown
): Response<ErrorResponse | SuccessType> | undefined {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.code });
  }
  return undefined;
}

function parseProductId(param?: string): number {
  const productId = Number(param);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new ServiceError("INVALID_PRODUCT_ID", 400);
  }
  return productId;
}

export async function listAllProducts(
  _req: Request<Record<string, never>, ProductsListResponse, Record<string, never>>,
  res: Response<ProductsListResponse>
): Promise<Response<ProductsListResponse>> {
  const products = await listProducts();
  return res.json({ products });
}

export async function getProduct(
  req: Request<{ id: string }, ProductDetailResponse | ErrorResponse, Record<string, never>>,
  res: Response<ProductDetailResponse | ErrorResponse>
): Promise<Response<ProductDetailResponse | ErrorResponse>> {
  try {
    const productId = parseProductId(req.params.id);
    const product = await getProductById(productId);
    return res.json({ product });
  } catch (error) {
    const handled = handleServiceError<ProductDetailResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}

export async function createNewProduct(
  req: ProductMutationRequest,
  res: Response<ProductMutationResponse | ErrorResponse>
): Promise<Response<ProductMutationResponse | ErrorResponse>> {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  try {
    const product = await createProduct(parsed.data);
    return res.status(201).json({ product });
  } catch (error) {
    const handled = handleServiceError<ProductMutationResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}

export async function updateExistingProduct(
  req: ProductMutationRequest<{ id: string }>,
  res: Response<ProductMutationResponse | ErrorResponse>
): Promise<Response<ProductMutationResponse | ErrorResponse>> {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  try {
    const productId = parseProductId(req.params.id);
    const product = await updateProduct(productId, parsed.data);
    return res.json({ product });
  } catch (error) {
    const handled = handleServiceError<ProductMutationResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}

export async function deleteProductById(
  req: Request<{ id: string }, void | ErrorResponse, Record<string, never>>,
  res: Response<void | ErrorResponse>
): Promise<Response<void | ErrorResponse>> {
  try {
    const productId = parseProductId(req.params.id);
    await deleteProduct(productId);
    return res.status(204).send();
  } catch (error) {
    const handled = handleServiceError<void>(res, error);
    if (handled) return handled;
    throw error;
  }
}
