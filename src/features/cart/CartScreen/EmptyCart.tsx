import { useAppTranslation } from "@/localization/content";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            {t("cart.yourCartIsEmpty")}</Text>
          <Text className="text-center font-vietnam text-body-md text-muted">
            {t("cart.chooseOrganicVegetablesAndFruitFrom")}</Text>
        </View>
        <PrimaryBtn
          fullWidth
          title={t("cart.exploreProduce")}
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
            {t("cart.chilledDeliveryAt68C")}</Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {t("cart.keepsProduceFreshFromFarmTo")}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-vietnam text-title-md text-ink">
          {t("cart.recommendedProduce")}</Text>
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-row items-center gap-1"
          onPress={openCatalog}
        >
          <Text className="font-vietnam text-label-md text-primary">
            {t("cart.viewAll")}</Text>
          <ArrowRight color={colors.primary} size={16} />
        </Pressable>
      </View>
    </View>
  );
}

function SuggestedProduct({ product }: { product: CatalogProduct }) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();

  return (
    <View className="mb-3 flex-row items-center rounded-lg border border-card-border bg-surface p-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.viewDetailsFor", { name: localize(product.name) })}
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
            label={localize(product.certification ?? product.badge)}
            tone="success"
          />
          <Text className="font-vietnam text-body-emphasis text-ink">
            {localize(product.name)}
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {localize(product.subtitle)}
          </Text>
          <Text className="font-vietnam text-label-lg tabular-nums text-primary">
            {formatPrice(product.price)}
          </Text>
        </View>
      </Pressable>
      <IconButton
        label={t("common.addToCart", { name: localize(product.name) })}
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
