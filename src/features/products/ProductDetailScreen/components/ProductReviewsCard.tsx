import { useTranslation } from "react-i18next";
import type { Product } from "@/types/product";
import type { AppColors } from "@/hooks/use-app-colors";
import { Star } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const reviews = [
  { initials: "MH", name: "Minh Hằng (Q.7, TP.HCM)", date: "products.yesterday", text: "products.theGreensArrivedWithDewStill" },
  { initials: "VT", name: "Văn Tuấn (Bình Thạnh)", date: "products.3DaysAgo", text: "products.theOriginWasClearAndThe" },
];

export function ProductReviewsCard({ product, colors }: { product: Product; colors: AppColors }) {
  const { t } = useTranslation();
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-vietnam text-title-md text-ink">{t("products.customerReviews")}</Text>
        <View className="flex-row items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1"><Star color={colors.secondary} fill={colors.secondary} size={14} /><Text className="font-vietnam text-label-sm text-on-secondary-container">{(product.rating ?? 4.9).toFixed(1)}</Text></View>
      </View>
      {reviews.map((review) => (
        <View key={review.initials} className="mb-2.5 rounded-xl bg-surface-container-low p-3 last:mb-0">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary-container"><Text className="font-vietnam text-label-sm text-on-secondary-container">{review.initials}</Text></View>
            <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{review.name}</Text><View className="mt-0.5 flex-row">{Array.from({ length: 5 }, (_, index) => <Star key={index} color="#F59E0B" fill="#F59E0B" size={12} />)}</View></View>
            <Text className="font-vietnam text-body-sm text-muted">{t(review.date)}</Text>
          </View>
          <Text className="mt-2 font-vietnam text-body-md text-ink">{t(review.text)}</Text>
        </View>
      ))}
    </DetailCard>
  );
}
