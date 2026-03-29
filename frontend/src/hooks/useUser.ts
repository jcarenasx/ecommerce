import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../lib/api";
import type { User } from "../types";

export function useUser() {
  return useQuery<User | null>({
    queryKey: ["user"],
    queryFn: fetchMe,
    staleTime: 60_000,
    retry: false,
  });
}
