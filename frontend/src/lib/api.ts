import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import type {
  CartItem,
  LoginInput,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  RegisterInput,
  User,
} from "../types";

type ApiErrorPayload = {
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<TResponse>(
  path: string,
  init: AxiosRequestConfig = {}
): Promise<TResponse> {
  try {
    const response = await axiosInstance({
      url: path,
      ...init,
    });

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return response.data as TResponse;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data as ApiErrorPayload | undefined;
      const message = payload?.error ?? error.message;
      throw new ApiError(message, status);
    }

    throw error;
  }
}

type AuthResponse = {
  user: User;
};

type ProductsResponse = {
  products: Product[];
};

type CartResponse = {
  items: CartItem[];
};

type CartItemResponse = {
  item: CartItem;
};

type OrdersResponse = {
  orders: Order[];
};

type OrderResponse = {
  order: Order;
};

export async function login(input: LoginInput): Promise<User> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    data: input,
  });

  return data.user;
}

export async function register(input: RegisterInput): Promise<User> {
  const data = await request<AuthResponse>("/auth/register", {
    method: "POST",
    data: {
      email: input.email,
      password: input.password,
      name: input.name,
    },
  });

  return data.user;
}

export async function fetchMe(): Promise<User | null> {
  try {
    const data = await request<AuthResponse>("/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  document.cookie =
    "ecom_access=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await request<ProductsResponse>("/products");
  return data.products;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const formattedInput = {
    name: input.name,
    priceCents: input.priceCents,
    imageUrl: input.imageUrl ?? null,
  };

  const data = await request<{ product: Product }>("/products", {
    method: "POST",
    data: formattedInput,
  });

  return data.product;
}

export async function editProduct(
  productId: number,
  input: ProductInput
): Promise<Product> {
  const formattedInput = {
    name: input.name,
    priceCents: input.priceCents,
    imageUrl: input.imageUrl ?? null,
  };

  const data = await request<{ product: Product }>(`/products/${productId}`, {
    method: "PUT",
    data: formattedInput,
  });

  return data.product;
}

export async function removeProduct(productId: number): Promise<void> {
  await request<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}

export async function fetchCart(): Promise<CartItem[]> {
  const data = await request<CartResponse>("/cart");
  return data.items;
}

export async function addToCart(productId: number, quantity = 1): Promise<CartItem> {
  const data = await request<CartItemResponse>("/cart", {
    method: "POST",
    data: { productId, quantity },
  });

  return data.item;
}

export async function updateCartItem(
  productId: number,
  quantity: number
): Promise<CartItem> {
  const data = await request<CartItemResponse>(`/cart/${productId}`, {
    method: "PUT",
    data: { quantity },
  });

  return data.item;
}

export async function deleteCartItem(productId: number): Promise<void> {
  await request<void>(`/cart/${productId}`, {
    method: "DELETE",
  });
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await request<OrdersResponse>("/orders");
  return data.orders;
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const data = await request<OrdersResponse>("/api/admin/orders");
  return data.orders;
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const data = await request<{ order: Order }>(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    data: { status },
  });

  return data.order;
}

export async function createOrder(): Promise<Order> {
  const data = await request<OrderResponse>("/orders", {
    method: "POST",
  });

  return data.order;
}
