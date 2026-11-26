import { ProductCard } from "@/components/product/ProductCard";
import { getProductCardBadges } from "@/components/product/product-card-badges";
import type { Product } from "@/types/product";
import { useAppColors } from "@/hooks/use-app-colors";
import { Star } from "lucide-react-native";
import { Text, View } from "react-native";
import { HomeSectionHeading } from "./HomeSectionHeading";

type RecommendedProductCardProps = {
  product: Product;
  className?: string;
  onPress?: (product: Product) => void;
  onAdd?: (product: Product) => void;
};

function Rating({ rating, reviewCount = 0 }: Pick<Product, "rating" | "reviewCount">) {
  const { secondary } = useAppColors();

  if (reviewCount <= 0 || rating === undefined || !Number.isFinite(rating)) {
    return <Text className="font-vietnam text-label-md text-muted">Mới</Text>;
  }

  return (
    <View className="flex-row items-center gap-1">
      <Star color={secondary} fill={secondary} size={14} />
      <Text className="font-vietnam text-label-md text-secondary">
        {rating.toFixed(1)}
      </Text>
      <Text className="shrink font-vietnam text-label-md text-muted" numberOfLines={1}>
        ({reviewCount.toLocaleString("vi-VN")})
      </Text>
    </View>
  );
}

export function RecommendedProductCard({
  product,
  className,
  onPress,
  onAdd,
}: RecommendedProductCardProps) {
  return (
    <ProductCard
      {...product}
      {...getProductCardBadges(product, { topLabel: product.badge })}
      className={className}
      meta={<Rating rating={product.rating} reviewCount={product.reviewCount} />}
      onPress={onPress && (() => onPress(product))}
      onAdd={onAdd && (() => onAdd(product))}
    />
  );
}

type RecommendationSectionProps = {
  products: Product[];
  onProductPress?: (product: Product) => void;
  onSeeMore?: () => void;
  onAddProduct?: (product: Product) => void;
};

export function RecommendationSection({
  products,
  onProductPress,
  onSeeMore,
  onAddProduct,
}: RecommendationSectionProps) {
  return (
    <View className="mt-8">
      <HomeSectionHeading
        actionLabel="Xem thêm ›"
        onActionPress={onSeeMore}
        subtitle="Dựa trên thói quen dinh dưỡng gia đình"
        title="Gợi ý món lành cho bạn"
      />
      <View className="flex-row flex-wrap justify-between gap-y-3 px-4">
        {products.map((product) => (
          <RecommendedProductCard
            key={product.id}
            className="w-[48.5%]"
            onPress={onProductPress}
            onAdd={onAddProduct}
            product={product}
          />
        ))}
      </View>
    </View>
  );
}
