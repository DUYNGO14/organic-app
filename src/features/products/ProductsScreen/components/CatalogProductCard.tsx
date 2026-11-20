import { CertBadge, IconButton, StatusChip } from "@/components/common";
import { addToCart } from "@/features/cart/add-to-cart";
import type { CatalogProduct } from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { ShoppingCartPlus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type CatalogProductCardProps = {
  product: CatalogProduct;
  onPress: (product: CatalogProduct) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

export function CatalogProductCard({
  product,
  onPress,
}: CatalogProductCardProps) {
  const colors = useAppColors();

  return (
    <View className="mx-1.5 flex-1 overflow-hidden rounded-2xl border border-card-border bg-surface-container-lowest p-2.5">
      <Pressable
        accessibilityLabel={`Xem chi tiết ${product.name}`}
        accessibilityRole="button"
        className="active:opacity-80"
        onPress={() => onPress(product)}
      >
        <View className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-low">
          <Image
            accessibilityLabel={product.name}
            cachePolicy="disk"
            contentFit="cover"
            source={product.image}
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
          {product.certification ? (
            <CertBadge
              className="absolute left-2 top-2"
              label={product.certification}
              showIcon={false}
            />
          ) : product.discountPercent ? (
            <StatusChip
              className="absolute left-2 top-2"
              label={`-${product.discountPercent}%`}
              tone="danger"
            />
          ) : product.topLabel ? (
            <StatusChip
              className="absolute left-2 top-2"
              label={product.topLabel}
              tone="neutral"
            />
          ) : null}
          {product.discountPercent && product.certification ? (
            <StatusChip
              className="absolute bottom-2 left-2"
              label={`-${product.discountPercent}%`}
              tone="danger"
            />
          ) : null}
          {product.bottomLabel ? (
            <StatusChip
              className="absolute bottom-2 left-2 bg-surface-container-lowest"
              label={product.bottomLabel}
              tone="neutral"
            />
          ) : null}
        </View>
        <Text
          className="mt-2.5 font-vietnam text-body-emphasis text-ink"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text
          className="mt-0.5 font-vietnam text-label-md text-muted"
          numberOfLines={1}
        >
          {product.subtitle}
        </Text>
      </Pressable>

      <View className="mt-3 flex-row items-center justify-between gap-1">
        <View className="min-w-0 flex-1">
          <Text
            className="font-vietnam text-title-md text-primary"
            numberOfLines={1}
          >
            {formatPrice(product.price)}
          </Text>
          <Text
            accessibilityElementsHidden={!product.oldPrice}
            className="mt-0.5 font-vietnam text-body-sm text-muted line-through"
            style={{ opacity: product.oldPrice ? 1 : 0 }}
          >
            {product.oldPrice ? formatPrice(product.oldPrice) : "\u00a0"}
          </Text>
        </View>
        <IconButton
          className="h-10 w-10 bg-primary"
          icon={<ShoppingCartPlus color={colors.onPrimary} size={16} />}
          label={`Thêm ${product.name} vào giỏ`}
          size="md"
          variant="filled"
          onPress={() => addToCart(product)}
        />
      </View>
    </View>
  );
}
