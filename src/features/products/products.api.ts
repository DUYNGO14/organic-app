import { api } from "@/lib/axios";
import type {
  ProductListParams,
  ProductListResponse,
} from "./products.types";

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
