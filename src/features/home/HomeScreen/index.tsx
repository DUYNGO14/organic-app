import { CategorySection } from "@/features/home/components/CategorySection";
import { DealSection } from "@/features/home/components/DealProductCard";
import { HomeSearchBar } from "@/features/home/components/HomeSearchBar";
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
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const openProduct = (product: (typeof dealProducts)[number]) => {
    router.push({
      pathname: "/(product)/product/[productId]",
      params: { productId: product.id },
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeSearchBar />
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
          onCategoryPress={() => router.push("/(tabs)/categories")}
          onSeeAll={() => router.push("/(tabs)/categories")}
        />
        <DealSection onProductPress={openProduct} products={dealProducts} />
        <TraceabilityCard onJournalPress={() => router.push("/(tabs)/farm")} />
        <RecommendationSection
          onProductPress={openProduct}
          onSeeMore={() => router.push("/(tabs)/categories")}
          products={recommendedProducts}
        />
        <QualityPromise />
      </ScrollView>
    </View>
  );
}
