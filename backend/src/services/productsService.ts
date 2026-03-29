import { ServiceError } from "../utils/errors";
import type { Product } from "../types";
import {
  fetchAllProducts,
  fetchProductById,
  insertProduct as insertProductRecord,
  updateProduct as updateProductRecord,
  deleteProduct as deleteProductRecord,
  ProductPayload,
} from "../models/productModel";

function normalizePayload(payload: ProductPayload): ProductPayload {
  return {
    name: payload.name,
    priceCents: payload.priceCents,
    imageUrl: payload.imageUrl ?? null,
  };
}

export async function listProducts(): Promise<Product[]> {
  return fetchAllProducts();
}

export async function getProductById(productId: number): Promise<Product> {
  const product = await fetchProductById(productId);
  if (!product) {
    throw new ServiceError("PRODUCT_NOT_FOUND", 404);
  }
  return product;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  return insertProductRecord(normalizePayload(payload));
}

export async function updateProduct(productId: number, payload: ProductPayload): Promise<Product> {
  await getProductById(productId);
  return updateProductRecord(productId, normalizePayload(payload));
}

export async function deleteProduct(productId: number): Promise<void> {
  await getProductById(productId);
  await deleteProductRecord(productId);
}
