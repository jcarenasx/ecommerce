import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/requireAuth";
import { prisma } from "../prisma";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithItems } from "../types";

const router = Router();

type ErrorResponse = {
  error: string;
  details?: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
};

type AdminOrderWithUser = OrderWithItems & {
  user: {
    email: string;
    phone: string | null;
  };
};

type AdminOrdersResponse = {
  orders: AdminOrderWithUser[];
};

type StatusParams = {
  id: string;
};

type UpdateStatusBody = {
  status: OrderStatus;
};

type UpdateOrderStatusResponse = {
  order: AdminOrderWithUser;
};

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

type AdminOrdersRequest = AuthedRequest &
  Request<Record<string, never>, AdminOrdersResponse | ErrorResponse, Record<string, never>>;

router.use(requireAuth);
router.use(requireAdmin);

router.get(
  "/",
  async (
    _req: AdminOrdersRequest,
    res: Response<AdminOrdersResponse | ErrorResponse>
  ): Promise<Response<AdminOrdersResponse | ErrorResponse>> => {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders });
  }
);

router.patch(
  "/:id/status",
  async (
    req: AuthedRequest &
      Request<StatusParams, UpdateOrderStatusResponse | ErrorResponse, UpdateStatusBody>,
    res: Response<UpdateOrderStatusResponse | ErrorResponse>
  ): Promise<Response<UpdateOrderStatusResponse | ErrorResponse>> => {
    const parsed = updateStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_BODY",
        details: parsed.error.flatten(),
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ error: "ORDER_NOT_FOUND" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
      },
      include: {
        items: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.json({ order: updatedOrder });
  }
);

export default router;
