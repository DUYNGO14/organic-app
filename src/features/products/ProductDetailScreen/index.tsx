import { IconButton, PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { selectCartQuantity, useCartStore } from "@/features/cart/cart.store";
import { catalogProducts } from "@/features/products/catalog.data";
import { getProductDetailSpec } from "@/features/products/product-detail.data";
import {
  ProductCommitmentsCard,
  ProductGallery,
  ProductInfoCard,
  ProductNutritionCard,
  ProductOriginCard,
  ProductPackageSelector,
  ProductPurchaseBar,
  ProductReviewsCard,
  ProductTraceabilityCard,
} from "@/features/products/ProductDetailScreen/components";
import { formatPrice } from "@/features/products/ProductDetailScreen/components/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { router, useLocalSearchParams } from "expo-router";
import { Share2, ShoppingBag } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, Share, Text, View } from "react-native";

const products = catalogProducts;

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useAppColors();
  const cartItemsCount = useCartStore(selectCartQuantity);
  const product = products.find((item) => item.id === productId);
  const spec = useMemo(
    () => (product ? getProductDetailSpec(product) : null),
    [product],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [packageIndex, setPackageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product || !spec) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="font-vietnam text-headline-sm text-ink">
          Không tìm thấy sản phẩm
        </Text>
        <PrimaryBtn
          className="mt-4"
          title="Quay lại"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const selectedPackage = spec.packages[packageIndex] ?? spec.packages[0];
  const discount = selectedPackage.oldPrice
    ? Math.round((1 - selectedPackage.price / selectedPackage.oldPrice) * 100)
    : product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  return (
    <View className="flex-1 bg-canvas">
      <StackHeader
        title="Chi tiết sản phẩm"
        rightAction={
          <View className="flex-row items-center gap-0.5">
            <IconButton
              icon={<Share2 color={colors.ink} size={20} />}
              label="Chia sẻ sản phẩm"
              size="sm"
              onPress={() =>
                void Share.share({
                  message: `${product.name} – ${formatPrice(selectedPackage.price)}`,
                })
              }
            />
            <View className="relative">
              <IconButton
                icon={<ShoppingBag color={colors.ink} size={20} />}
                label={cartItemsCount ? `Giỏ hàng, ${cartItemsCount} sản phẩm` : "Giỏ hàng"}
                size="sm"
                onPress={() => router.push("/cart")}
              />
              {cartItemsCount > 0 ? <View
                pointerEvents="none"
                className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1"
              >
                <Text className="font-vietnam text-label-sm font-bold text-on-primary">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </Text>
              </View> : null}
            </View>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProductGallery
          product={product}
          spec={spec}
          imageIndex={imageIndex}
          onImageSelect={setImageIndex}
          colors={colors}
        />
        <ProductInfoCard
          product={product}
          selectedPackage={selectedPackage}
          packageIndex={packageIndex}
          discount={discount}
          colors={colors}
        />
        <ProductCommitmentsCard colors={colors} />
        <ProductTraceabilityCard spec={spec} colors={colors} />
        <ProductPackageSelector
          spec={spec}
          packageIndex={packageIndex}
          onPackageChange={setPackageIndex}
          quantity={quantity}
          onQuantityChange={setQuantity}
          colors={colors}
        />
        <ProductNutritionCard spec={spec} colors={colors} />
        <ProductOriginCard spec={spec} colors={colors} />
        <ProductReviewsCard product={product} colors={colors} />
      </ScrollView>

      <ProductPurchaseBar
        product={product}
        selectedPackage={selectedPackage}
        quantity={quantity}
        colors={colors}
      />
    </View>
  );
}
