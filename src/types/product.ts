export type BaseProduct = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  price: number;
  oldPrice?: number;
  certification?: string;
};

export type Product = BaseProduct & {
  origin: string;
  badge: string;
  soldPercent?: number;
  rating?: number;
  reviewCount?: number;
};

export type ProductCategoryId =
  | "greens"
  | "fruit"
  | "roots"
  | "eggs"
  | "mushrooms"
  | "grains"
  | "herbs";

export type SeasonFilterId =
  | "in-season"
  | "cold-region"
  | "early-harvest";

export type CatalogProduct = Product & {
  categoryIds: ProductCategoryId[];
  topLabel?: string;
  bottomLabel?: string;
  seasonTags: SeasonFilterId[];
  /** Higher values represent more recently harvested products. */
  harvestOrder: number;
};

export type PackageOption = {
  label: string;
  price: number;
  oldPrice?: number;
  note: string;
};
