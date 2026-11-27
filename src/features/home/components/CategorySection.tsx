import { useAppTranslation } from "@/localization/content";
import type { HomeCategory } from "@/features/home/home.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { Pressable, ScrollView, Text, View } from "react-native";
import { HomeSectionHeading } from "./HomeSectionHeading";

type CategorySectionProps = {
  categories: HomeCategory[];
  onSeeAll?: () => void;
  onCategoryPress?: (category: HomeCategory) => void;
};

export function CategorySection({
  categories,
  onSeeAll,
  onCategoryPress,
}: CategorySectionProps) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();

  return (
    <View className="mt-6">
      <HomeSectionHeading
        actionLabel={t("home.all")}
        onActionPress={onSeeAll}
        title={t("home.productCategories")}
      />
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-2 px-4">
          {categories.map((category) => (
            <Pressable
              accessibilityLabel={`${localize(category.title)}, ${localize(category.subtitle)}`}
              accessibilityRole="button"
              className="min-h-12 flex-row items-center gap-2 rounded-full border border-card-border bg-surface py-1 pl-2 pr-3 active:bg-surface-container"
              key={category.id}
              onPress={() => onCategoryPress?.(category)}
            >
              <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-surface-container">
                <category.Icon color={colors.primary} size={18} />
                <Image
                  cachePolicy="disk"
                  contentFit="cover"
                  source={category.image}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </View>
              <Text
                className="font-vietnam text-label-md text-ink"
                numberOfLines={1}
              >
                {localize(category.title)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
