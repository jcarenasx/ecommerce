import { addToCart } from "./api";
import type { CartItem, Product } from "../types";

export const GUEST_CART_STORAGE_KEY = "guest_cart_items";

type AddItemInput = {
  product: Product;
  quantity?: number;
};

type UpdateItemInput = {
  productId: number;
  quantity: number;
};

export function readGuestCart(): CartItem[] {
  const rawValue = localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    return JSON.parse(rawValue) as CartItem[];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): CartItem[] {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function clearGuestCart(): void {
  localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

export function upsertGuestCartItem(
  items: CartItem[],
  input: AddItemInput
): CartItem[] {
  const quantityToAdd = input.quantity ?? 1;
  const existingItem = items.find(
    (item: CartItem) => item.productId === input.product.id
  );

  if (!existingItem) {
    const timestamp = new Date().toISOString();

    return [
      ...items,
      {
        id: `guest-${input.product.id}`,
        userId: "guest",
        productId: input.product.id,
        quantity: quantityToAdd,
        createdAt: timestamp,
        updatedAt: timestamp,
        product: input.product,
      },
    ];
  }

  return items.map((item: CartItem) =>
    item.productId === input.product.id
      ? {
          ...item,
          quantity: item.quantity + quantityToAdd,
          updatedAt: new Date().toISOString(),
        }
      : item
  );
}

export function updateGuestCartItem(
  items: CartItem[],
  input: UpdateItemInput
): CartItem[] {
  return items
    .map((item: CartItem) =>
      item.productId === input.productId
        ? {
            ...item,
            quantity: input.quantity,
            updatedAt: new Date().toISOString(),
          }
        : item
    )
    .filter((item: CartItem) => item.quantity > 0);
}

export function removeGuestCartItem(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item: CartItem) => item.productId !== productId);
}

export async function syncGuestCartToServer(): Promise<void> {
  const guestItems = readGuestCart();

  if (guestItems.length === 0) {
    return;
  }

  for (const item of guestItems) {
    await addToCart(item.productId, item.quantity);
  }

  clearGuestCart();
}
