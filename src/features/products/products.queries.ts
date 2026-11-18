import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./products.api";
import type { ProductListParams } from "./products.types";

/** Centralized, hierarchical query keys make cache updates predictable. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts(params: ProductListParams = { limit: 20, skip: 0 }) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => getProducts(params, signal),
  });
}
