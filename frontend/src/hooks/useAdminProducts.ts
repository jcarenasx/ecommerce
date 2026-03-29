import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, editProduct, removeProduct } from "../lib/api";
import type { Product, ProductInput } from "../types";

type EditProductInput = {
  productId: number;
  input: ProductInput;
};

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const refreshProducts = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createProductMutation = useMutation({
    mutationFn: (input: ProductInput): Promise<Product> => createProduct(input),
    onSuccess: refreshProducts,
  });

  const editProductMutation = useMutation({
    mutationFn: ({ productId, input }: EditProductInput): Promise<Product> =>
      editProduct(productId, input),
    onSuccess: refreshProducts,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number): Promise<void> => removeProduct(productId),
    onSuccess: refreshProducts,
  });

  return {
    createProduct: createProductMutation,
    editProduct: editProductMutation,
    deleteProduct: deleteProductMutation,
  };
}
