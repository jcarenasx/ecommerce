import type {
  CartItem as PrismaCartItem,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Product as PrismaProduct,
  User as PrismaUser,
} from "@prisma/client";

export type User = PrismaUser;
export type Product = PrismaProduct;
export type CartItem = PrismaCartItem;
export type OrderItem = PrismaOrderItem;
export type Order = PrismaOrder;

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type PublicUser = Omit<User, "passwordHash">;
