import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProducts } from "./products.api";
import type { ProductListParams } from "./products.types";

/** Centralized, hierarchical query keys make cache updates predictable. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  infiniteList: (limit: number) => [...productKeys.lists(), "infinite", { limit }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts(params: ProductListParams = { limit: 20, skip: 0 }) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => getProducts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteProducts({ limit = 20 }: { limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.infiniteList(limit),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getProducts({ limit, skip: pageParam }, signal),
    getNextPageParam: (page, _pages, pageParam) => {
      const nextSkip = page.skip + page.products.length;

      if (page.products.length === 0 || nextSkip >= page.total || nextSkip <= pageParam) {
        return undefined;
      }

      return nextSkip;
    },
  });
}
