import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, deleteCartItem, fetchCart, updateCartItem } from "../lib/api";
import type { CartItem } from "../types";
import type { Product } from "../types";
import { useAuth } from "./useAuth";
import {
  readGuestCart,
  removeGuestCartItem,
  updateGuestCartItem,
  upsertGuestCartItem,
  writeGuestCart,
} from "../lib/guestCart";

type AddItemInput = {
  product: Product;
  quantity?: number;
};

type UpdateItemInput = {
  productId: number;
  quantity: number;
};

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const cartQuery = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: () => (isAuthenticated ? fetchCart() : Promise.resolve(readGuestCart())),
    staleTime: 15_000,
  });

  const invalidateCart = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const addItem = useMutation({
    mutationFn: async (input: AddItemInput): Promise<CartItem> => {
      if (isAuthenticated) {
        return addToCart(input.product.id, input.quantity);
      }

      const nextItems = writeGuestCart(
        upsertGuestCartItem(readGuestCart(), input)
      );
      const createdItem = nextItems.find(
        (item: CartItem) => item.productId === input.product.id
      );

      if (!createdItem) {
        throw new Error("No se pudo agregar el producto al carrito.");
      }

      return createdItem;
    },
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  const updateItem = useMutation({
    mutationFn: async (input: UpdateItemInput): Promise<CartItem | null> => {
      if (isAuthenticated) {
        return updateCartItem(input.productId, input.quantity);
      }

      const nextItems = writeGuestCart(
        updateGuestCartItem(readGuestCart(), input)
      );
      return (
        nextItems.find((item: CartItem) => item.productId === input.productId) ?? null
      );
    },
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  const removeItem = useMutation({
    mutationFn: async (productId: number): Promise<void> => {
      if (isAuthenticated) {
        await deleteCartItem(productId);
        return;
      }

      writeGuestCart(removeGuestCartItem(readGuestCart(), productId));
    },
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  return {
    ...cartQuery,
    items: cartQuery.data ?? [],
    addItem,
    updateItem,
    removeItem,
  };
}
