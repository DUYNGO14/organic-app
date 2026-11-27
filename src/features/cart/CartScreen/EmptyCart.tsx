import { IconButton, PrimaryBtn, StatusChip } from "@/components/common";
import { addToCart } from "@/features/cart/add-to-cart";
import { catalogProducts } from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import type { CatalogProduct } from "@/types/product";
import { formatPrice } from "@/utils/format-price";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowRight,
  Leaf,
  ShoppingBasket,
  ShoppingCartPlus,
  Snowflake,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const suggestedProducts = catalogProducts.filter(({ id }) =>
  ["kale", "strawberries", "avocado"].includes(id),
);

export function openCatalog() {
  router.dismissTo("/(tabs)/categories");
}

function EmptyCartHeader() {
  const colors = useAppColors();

  return (
    <View className="gap-4 pb-3">
      <View className="items-center gap-4 rounded-lg border border-card-border bg-surface px-4 py-8">
        <View className="h-28 w-28 items-center justify-center rounded-full bg-surface-container">
          <ShoppingBasket color={colors.primary} size={54} strokeWidth={1.5} />
          <View className="absolute right-4 top-3 h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Leaf color={colors.onPrimary} size={16} />
          </View>
        </View>
        <View className="gap-2">
          <Text className="text-center font-vietnam text-headline-sm text-ink">
            Giỏ hàng của bạn còn trống
          </Text>
          <Text className="text-center font-vietnam text-body-md text-muted">
            Chọn rau củ, trái cây hữu cơ từ các nông trại cho bữa ăn hôm nay.
          </Text>
        </View>
        <PrimaryBtn
          fullWidth
          title="Khám phá nông sản"
          trailingIcon={<ArrowRight color={colors.onPrimary} size={18} />}
          onPress={openCatalog}
        />
      </View>
      <View className="flex-row items-center gap-3 rounded-lg bg-surface-container p-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-cold-container">
          <Snowflake color={colors.primary} size={23} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-body-emphasis text-ink">
            Vận chuyển lạnh 6–8°C
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            Giữ nông sản tươi từ nông trại đến tay bạn.
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-vietnam text-title-md text-ink">
          Nông sản gợi ý
        </Text>
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-row items-center gap-1"
          onPress={openCatalog}
        >
          <Text className="font-vietnam text-label-md text-primary">
            Xem tất cả
          </Text>
          <ArrowRight color={colors.primary} size={16} />
        </Pressable>
      </View>
    </View>
  );
}

function SuggestedProduct({ product }: { product: CatalogProduct }) {
  const colors = useAppColors();

  return (
    <View className="mb-3 flex-row items-center rounded-lg border border-card-border bg-surface p-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem ${product.name}`}
        className="min-w-0 flex-1 flex-row items-center gap-3 p-1 active:opacity-80"
        onPress={() =>
          router.push({
            pathname: "/(product)/product/[productId]",
            params: { productId: product.id },
          })
        }
      >
        <View className="h-20 w-20 overflow-hidden rounded bg-surface-container">
          <Image
            source={product.image}
            recyclingKey={product.id}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <StatusChip
            label={product.certification ?? product.badge}
            tone="success"
          />
          <Text className="font-vietnam text-body-emphasis text-ink">
            {product.name}
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {product.subtitle}
          </Text>
          <Text className="font-vietnam text-label-lg tabular-nums text-primary">
            {formatPrice(product.price)}
          </Text>
        </View>
      </Pressable>
      <IconButton
        label={`Thêm ${product.name} vào giỏ`}
        size="lg"
        variant="filled"
        icon={<ShoppingCartPlus color={colors.onPrimary} size={21} />}
        onPress={() => addToCart(product)}
      />
    </View>
  );
}

export function EmptyCart() {
  return (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      data={suggestedProducts}
      keyExtractor={(product) => product.id}
      ListHeaderComponent={EmptyCartHeader}
      renderItem={({ item }) => <SuggestedProduct product={item} />}
    />
  );
}
