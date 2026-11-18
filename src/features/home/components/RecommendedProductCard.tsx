import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import type { HomeProduct } from "@/features/home/home.data";
import { Image } from "expo-image";
import { Plus, Star } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { HomeSectionHeading } from "./HomeSectionHeading";

type RecommendedProductCardProps = {
  product: HomeProduct;
  onPress?: (product: HomeProduct) => void;
  onAdd?: (product: HomeProduct) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

export function RecommendedProductCard({
  product,
  onPress,
  onAdd,
}: RecommendedProductCardProps) {
  const colors = useAppColors();

  return (
    <View className="w-[48.5%] rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest p-3 shadow-sm dark:border-[#00E676]/[0.12]">
      <Pressable accessibilityRole="button" onPress={() => onPress?.(product)}>
      <View className="relative h-36 overflow-hidden rounded-xl bg-surface-container-low">
        <Image
          accessibilityLabel={product.name}
          cachePolicy="disk"
          contentFit="cover"
          source={product.image}
          style={{ width: "100%", height: "100%" }}
          transition={200}
        />
        <View className="absolute left-2 top-2 rounded-lg bg-surface-container-lowest/95 px-2 py-1">
          <Text className="font-vietnam text-label-sm text-secondary">
            {product.badge}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row items-center gap-1">
        <Star color={colors.secondary} fill={colors.secondary} size={14} />
        <Text className="font-vietnam text-label-md text-secondary">
          {product.rating}
        </Text>
        <Text className="font-vietnam text-body-sm text-muted">
          ({product.reviewCount})
        </Text>
      </View>
      <Text
        className="mt-2 font-vietnam text-body-emphasis text-ink"
        numberOfLines={1}
      >
        {product.name}
      </Text>
      <Text
        className="mt-1 font-vietnam text-body-sm text-muted"
        numberOfLines={1}
      >
        {product.subtitle}
      </Text>
      </Pressable>
      <View className="mt-4 flex-row items-center justify-between gap-1">
        <Pressable accessibilityRole="button" className="flex-1" onPress={() => onPress?.(product)}>
          <Text className="font-vietnam text-title-md text-primary" numberOfLines={1}>
            {formatPrice(product.price)}
          </Text>
        </Pressable>
        <IconButton
          label={`Thêm ${product.name} vào giỏ`}
          size="sm"
          variant="filled"
          disabled={!onAdd}
          onPress={() => onAdd?.(product)}
          icon={<Plus color={colors.onPrimary} size={20} />}
        />
      </View>
    </View>
  );
}

type RecommendationSectionProps = {
  products: HomeProduct[];
  onProductPress?: (product: HomeProduct) => void;
  onSeeMore?: () => void;
  onAddProduct?: (product: HomeProduct) => void;
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
            onPress={onProductPress}
            onAdd={onAddProduct}
            product={product}
          />
        ))}
      </View>
    </View>
  );
}
