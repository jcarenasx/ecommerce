import type { Request, Response } from "express";
import type { AuthedRequest } from "../auth";
import { ServiceError } from "../utils/errors";
import { createOrderFromCart, listOrdersForUser } from "../services/ordersService";
import type { OrderWithItems } from "../types";

type OrdersListResponse = {
  orders: OrderWithItems[];
};

type OrderResponse = {
  order: OrderWithItems;
};

type ErrorResponse = {
  error: string;
};

type OrdersRequest = AuthedRequest &
  Request<Record<string, never>, OrdersListResponse, Record<string, never>>;

type CreateOrderRequest = AuthedRequest &
  Request<Record<string, never>, OrderResponse | ErrorResponse, Record<string, never>>;

function handleServiceError(res: Response<ErrorResponse>, error: unknown): Response<ErrorResponse> | undefined {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.code });
  }
  return undefined;
}

export async function getOrders(
  req: OrdersRequest,
  res: Response<OrdersListResponse>
): Promise<Response<OrdersListResponse>> {
  const orders = await listOrdersForUser(req.auth!.userId);
  return res.json({ orders });
}

export async function createOrder(
  req: CreateOrderRequest,
  res: Response<OrderResponse | ErrorResponse>
): Promise<Response<OrderResponse | ErrorResponse>> {
  try {
    const order = await createOrderFromCart(req.auth!.userId);
    return res.status(201).json({ order });
  } catch (error) {
    const handled = handleServiceError(res, error);
    if (handled) return handled as Response<OrderResponse | ErrorResponse>;
    throw error;
  }
}
