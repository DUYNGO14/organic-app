import {
  ScreenSkeleton,
  type ScreenLoadingProps,
} from "@/components/common/Skeleton/ScreenSkeleton";
import { addToCart } from "@/features/cart/add-to-cart";
import { CategorySection } from "@/features/home/components/CategorySection";
import { DealSection } from "@/features/home/components/DealProductCard";
import { NewsCarousel } from "@/features/home/components/NewsCarousel";
import { QualityPromise } from "@/features/home/components/QualityPromise";
import { RecommendationSection } from "@/features/home/components/RecommendedProductCard";
import { TraceabilityCard } from "@/features/home/components/TraceabilityCard";
import {
  dealProducts,
  homeBanners,
  homeCategories,
  recommendedProducts,
} from "@/features/home/home.data";
import { ProductSearchBar } from "@/features/products/components/ProductSearchBar";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";

export default function HomeScreen({
  isLoading = false,
}: ScreenLoadingProps = {}) {
  const [search, setSearch] = useState("");

  const openProduct = (product: (typeof dealProducts)[number]) => {
    router.push({
      pathname: "/(product)/product/[productId]",
      params: { productId: product.id },
    });
  };
  const openScanner = () => {
    Keyboard.dismiss();
    router.push("/scan-qr");
  };

  function submitSearch(text: string) {
    const query = text.trim();
    if (!query) return;
    Keyboard.dismiss();
    router.push({ pathname: "/(tabs)/categories", params: { query } });
  }

  if (isLoading) return <ScreenSkeleton variant="home" />;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProductSearchBar
          value={search}
          onChangeText={setSearch}
          onScanPress={openScanner}
          onSubmitSearch={submitSearch}
        />
        <View className="mt-2">
          <NewsCarousel
            banners={homeBanners}
            onBannerPress={(banner) =>
              router.push(
                banner.id === "traceability"
                  ? "/(tabs)/farm"
                  : "/(tabs)/categories",
              )
            }
          />
        </View>
        <CategorySection
          categories={homeCategories}
          onCategoryPress={({ id }) => {
            if (id === "farms") {
              router.push("/(tabs)/farm");
              return;
            }

            router.push({
              pathname: "/(tabs)/categories",
              params: { categoryId: id },
            });
          }}
          onSeeAll={() => router.push("/(tabs)/categories")}
        />
        <DealSection
          onAddProduct={addToCart}
          onProductPress={openProduct}
          products={dealProducts}
        />
        <TraceabilityCard
          onScanPress={openScanner}
          onJournalPress={() => router.push("/(tabs)/farm")}
        />
        <RecommendationSection
          onAddProduct={addToCart}
          onProductPress={openProduct}
          onSeeMore={() => router.push("/(tabs)/categories")}
          products={recommendedProducts}
        />
        <QualityPromise />
      </ScrollView>
    </View>
  );
}
