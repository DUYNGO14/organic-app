import { ProductCard } from "@/components/product/ProductCard";
import { getProductCardBadges } from "@/components/product/product-card-badges";
import type { CatalogProduct } from "@/types/product";

type CatalogProductCardProps = {
  product: CatalogProduct;
  className?: string;
  onPress: (product: CatalogProduct) => void;
  onAdd?: (product: CatalogProduct) => void;
};

export function CatalogProductCard({
  product,
  className,
  onPress,
  onAdd,
}: CatalogProductCardProps) {
  return (
    <ProductCard
      {...product}
      {...getProductCardBadges(product, product)}
      className={className}
      onPress={() => onPress(product)}
      onAdd={onAdd && (() => onAdd(product))}
    />
  );
}
