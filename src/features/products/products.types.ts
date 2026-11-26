import type { PaginatedData } from "@/types/api";
import type { CatalogProduct, ProductCategoryId, SeasonFilterId } from "@/types/product";

type DummyJsonProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
};

export type ProductListResponse = {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductListParams = {
  limit: number;
  skip: number;
};
export type PriceBandId = "under-25" | "25-50" | "50-100" | "over-100";
export type ProductSortId = "harvest" | "price-asc" | "price-desc";

export type CatalogListFilters = {
  query?: string;
  categoryIds?: ProductCategoryId[];
  season?: SeasonFilterId;
  certifications?: string[];
  priceBand?: PriceBandId;
  sort: ProductSortId;
};

export type CatalogListParams = CatalogListFilters & {
  page: number;
  limit: number;
};

export type CatalogListData = PaginatedData<CatalogProduct> & {
  /** Available certification filters for the entire catalog. */
  certifications?: string[];
};
