import { i18n } from "@/localization";
import { api, unwrapApiResponse } from "@/lib/axios";
import type { ApiError, SimpleResponse } from "@/types/api";
import type {
  CatalogListData,
  CatalogListParams,
  ProductListParams,
  ProductListResponse,
} from "./products.types";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const isCatalogApiConfigured = Boolean(
  configuredApiUrl &&
    !/^https?:\/\/(api\.example\.com|dummyjson\.com)(?=[:/?#]|$)/i.test(configuredApiUrl),
);

/** HTTP layer: endpoints, request params, and response types live here. */
export async function getProducts(
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>("/products", {
    params,
    signal,
  });
  return response.data;
}

export async function getCatalogProducts(
  params: CatalogListParams,
  signal?: AbortSignal,
): Promise<CatalogListData> {
  const response = await api.get<SimpleResponse<CatalogListData> | ApiError>("/products", {
    params,
    paramsSerializer: { indexes: null },
    signal,
  });
  const page = unwrapApiResponse(response.data);
  if (
    !Array.isArray(page?.items) ||
    !Number.isSafeInteger(page.total) ||
    page.total < 0 ||
    page.page !== params.page ||
    typeof page.hasNext !== "boolean"
  ) {
    throw new Error(i18n.t("products.invalidProductPaginationData"));
  }
  return page;
}
