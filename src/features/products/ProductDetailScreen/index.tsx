import { useAppTranslation } from "@/localization/content";
import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { IconButton, PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { useAuthStore } from "@/features/auth/auth.store";
import { requestSignIn } from "@/features/auth/member-access";
import {
  selectCartQuantity,
  useCartStore,
  type CartLine,
} from "@/features/cart/cart.store";
import { CheckoutBottomSheet } from "@/features/cart/CartScreen/CheckoutBottomSheet";
import { catalogProducts } from "@/features/products/catalog.data";
import { getProductDetailSpec } from "@/features/products/product-detail.data";
import { productKeys } from "@/features/products/products.queries";
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
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import type { CatalogProduct } from "@/types/product";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Share2, ShoppingBag } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, Share, Text, View } from "react-native";

const products = catalogProducts;

export default function ProductDetailScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const { t, localize } = useAppTranslation();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const cartItemsCount = useCartStore(selectCartQuantity);
  const visibleCartCount = session ? cartItemsCount : 0;
  const product =
    queryClient.getQueryData<CatalogProduct>(productKeys.detail(productId)) ??
    products.find((item) => item.id === productId);
  const spec = useMemo(
    () => (product ? getProductDetailSpec(product) : null),
    [product],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [packageIndex, setPackageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [buyNowLine, setBuyNowLine] = useState<CartLine | null>(null);
  const activeCheckoutLine = session ? buyNowLine : null;
  const buyNowOpen = activeCheckoutLine !== null;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/categories");
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <StackHeader
          title={t("products.productDetails")}
          onBack={goBack}
        />
        <ScreenSkeleton variant="product" />
      </View>
    );
  }

  if (!product || !spec) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="font-vietnam text-headline-sm text-ink">
          {t("products.productNotFound")}</Text>
        <PrimaryBtn
          className="mt-4"
          title={t("common.back")}
          onPress={goBack}
        />
      </View>
    );
  }

  const selectedPackage = spec.packages[packageIndex] ?? spec.packages[0];
  const checkoutLine: CartLine = {
    id: product.id,
    product,
    pack: selectedPackage,
    quantity,
    selected: true,
  };
  const discount = selectedPackage.oldPrice
    ? Math.round((1 - selectedPackage.price / selectedPackage.oldPrice) * 100)
    : product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  return (
    <>
      <View
        className="flex-1 bg-canvas"
        accessibilityElementsHidden={buyNowOpen}
        importantForAccessibility={buyNowOpen ? "no-hide-descendants" : "auto"}
      >
        <StackHeader
          title={t("products.productDetails")}
          onBack={goBack}
          rightAction={
            <View className="flex-row items-center gap-0.5">
              <IconButton
                icon={<Share2 color={colors.ink} size={20} />}
                label={t("products.shareProduct")}
                size="sm"
                onPress={() =>
                  void Share.share({
                    message: `${localize(product.name)} – ${formatPrice(selectedPackage.price)}`,
                  })
                }
              />
              <View className="relative">
                <IconButton
                  icon={<ShoppingBag color={colors.ink} size={20} />}
                  label={
                    visibleCartCount
                      ? t("common.cartItems", { count: visibleCartCount })
                      : t("common.cart")
                  }
                  size="sm"
                  onPress={() => requestSignIn(() => router.push("/cart"))}
                />
                {visibleCartCount > 0 ? (
                  <View
                    pointerEvents="none"
                    className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1"
                  >
                    <Text className="font-vietnam text-label-sm font-bold text-on-primary">
                      {visibleCartCount > 99 ? "99+" : visibleCartCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          }
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 6,
            paddingBottom: 24,
            gap: 12,
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
          <ProductPackageSelector
            spec={spec}
            packageIndex={packageIndex}
            onPackageChange={setPackageIndex}
            quantity={quantity}
            onQuantityChange={setQuantity}
            colors={colors}
          />
          <ProductCommitmentsCard colors={colors} />
          <ProductTraceabilityCard colors={colors} onScan={() => router.push("/scan-qr")} />

          <ProductNutritionCard spec={spec} colors={colors} />
          <ProductOriginCard spec={spec} colors={colors} />
          <ProductReviewsCard product={product} colors={colors} />
        </ScrollView>

        <ProductPurchaseBar
          product={product}
          selectedPackage={selectedPackage}
          quantity={quantity}
          colors={colors}
          onBuyNow={() => requestSignIn(() => setBuyNowLine(checkoutLine))}
        />
      </View>
      {activeCheckoutLine ? (
        <CheckoutBottomSheet
          lines={[activeCheckoutLine]}
          onClose={() => setBuyNowLine(null)}
          onQuantityChange={(_, nextQuantity) => {
            setQuantity(nextQuantity);
            setBuyNowLine((line) => line && { ...line, quantity: nextQuantity });
          }}
        />
      ) : null}
    </>
  );
}
