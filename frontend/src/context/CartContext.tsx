import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types/product";

const CART_STORAGE_KEY = "ecommerce_cart";

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Product) => void;
  decrementFromCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  decrementFromCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

interface Props {
  children: ReactNode;
}

export const CartProvider = ({ children }: Props) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return [];

    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const decrementFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decrementFromCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
