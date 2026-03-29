import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminOrders, updateAdminOrderStatus } from "../lib/api";
import type { Order, OrderStatus } from "../types";

type UpdateOrderStatusInput = {
  orderId: string;
  status: OrderStatus;
};

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders", "admin"],
    queryFn: fetchAdminOrders,
    staleTime: 15_000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusInput): Promise<Order> =>
      updateAdminOrderStatus(orderId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    ...ordersQuery,
    updateStatus,
  };
}
