import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
}
