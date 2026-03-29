import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, fetchOrders } from "../lib/api";
import type { Order } from "../types";
import { useAuth } from "./useAuth";

export function useOrders() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    ...ordersQuery,
    orders: ordersQuery.data ?? [],
    createOrder: createOrderMutation,
  };
}
