import { useQuery } from "@tanstack/react-query";
import { api, ApiProduct } from "@/services/api";

export function useProducts() {
  return useQuery<ApiProduct[]>({
    queryKey: ["products"],
    queryFn: () => api.getProducts(),
    staleTime: 60_000,
  });
}
