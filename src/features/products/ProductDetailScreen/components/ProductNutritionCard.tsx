import { useAppTranslation } from "@/localization/content";
import type { ProductDetailSpec } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Activity, Award, Utensils } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const mealIdeas = ["products.smoothies", "products.freshSalads", "products.stirFries"];
const mealMarks = ["◉", "✿", "⌁"];

export function ProductNutritionCard({ spec, colors }: { spec: ProductDetailSpec; colors: AppColors }) {
  const { t, localize } = useAppTranslation();
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center gap-2"><Activity color={colors.secondary} size={22} /><Text className="font-vietnam text-title-md text-ink">{t("products.nutritionHighlights")}</Text></View>
      <View className="flex-row gap-2.5">
        {spec.nutrition.map((item) => (
          <View key={localize(item.title)} className="min-w-0 flex-1 rounded-xl bg-surface-container-low p-3">
            <Text className="font-vietnam text-headline-sm text-primary">{localize(item.value)}</Text>
            <Text className="mt-1 font-vietnam text-body-emphasis text-ink">{localize(item.title)}</Text>
            <Text className="mt-1 font-vietnam text-body-sm text-muted">{localize(item.note)}</Text>
          </View>
        ))}
      </View>
      <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-secondary-container/40 p-3"><Award color={colors.secondary} size={20} /><Text className="flex-1 font-vietnam text-body-md text-ink">{localize(spec.highlight)}</Text></View>
      <View className="mt-4">
        <View className="mb-2 flex-row items-center gap-2"><Utensils color={colors.primary} size={18} /><Text className="font-vietnam text-body-emphasis text-ink">{t("products.quickServingIdeas")}</Text></View>
        <View className="flex-row gap-2">
          {mealIdeas.map((label, index) => (
            <View key={label} className="flex-1 items-center rounded-xl bg-surface-container-low p-3">
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest"><Text className="font-vietnam text-title-md text-secondary">{mealMarks[index]}</Text></View>
              <Text className="text-center font-vietnam text-label-sm text-ink">{t(label)}</Text>
            </View>
          ))}
        </View>
      </View>
    </DetailCard>
  );
}
