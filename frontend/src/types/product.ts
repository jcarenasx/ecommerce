export type Product = {
  id: number;
  name: string;
  price: number;
  /** Product image URL; optional for backwards compatibility with saved carts */
  image?: string;
};

export type CartItem = Product & {
  quantity: number;
};
