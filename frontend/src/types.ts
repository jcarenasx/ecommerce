export type UserRole = "USER" | "ADMIN";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type User = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  priceCents: number;
  imageUrl?: string | null;
};

export type CartItem = {
  id: string;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: number;
  name: string;
  quantity: number;
  priceCents: number;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    email: string;
    phone: string | null;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};
