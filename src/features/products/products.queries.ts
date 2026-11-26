import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCatalogProducts, getProducts, isCatalogApiConfigured } from "./products.api";
import type { CatalogListFilters, ProductListParams } from "./products.types";

/** Centralized, hierarchical query keys make cache updates predictable. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  infiniteList: (limit: number, filters: CatalogListFilters) =>
    [...productKeys.lists(), "infinite", { limit, ...filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), String(id)] as const,
};

export function useProducts(params: ProductListParams = { limit: 20, skip: 0 }) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => getProducts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteProducts(filters: CatalogListFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: productKeys.infiniteList(limit, filters),
    enabled: isCatalogApiConfigured,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getCatalogProducts({ ...filters, limit, page: pageParam }, signal),
    getNextPageParam: (page) =>
      page.hasNext && page.items.length > 0 ? page.page + 1 : undefined,
  });
}
