import { prisma } from "../prisma";
import type { Product } from "../types";

export type ProductPayload = {
  name: string;
  priceCents: number;
  imageUrl?: string | null;
};

export async function fetchAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({ orderBy: { id: "asc" } });
}

export async function fetchProductById(productId: number): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id: productId } });
}

export async function insertProduct(data: ProductPayload): Promise<Product> {
  return prisma.product.create({ data });
}

export async function updateProduct(productId: number, data: ProductPayload): Promise<Product> {
  return prisma.product.update({ where: { id: productId }, data });
}

export async function deleteProduct(productId: number): Promise<void> {
  await prisma.product.delete({ where: { id: productId } });
}
