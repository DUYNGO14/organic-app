import type { HomeCategory } from "@/features/home/home.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { Pressable, Text, View } from "react-native";
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
  const colors = useAppColors();

  return (
    <View className="mt-7">
      <HomeSectionHeading
        actionLabel="Tất cả"
        onActionPress={onSeeAll}
        title="Danh mục tuyển chọn"
      />
      <View className="flex-row flex-wrap justify-between gap-y-3 px-4">
        {categories.map(({ id, title, subtitle, Icon }) => (
          <Pressable
            accessibilityRole="button"
            className="w-[31.5%] items-center rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest px-2 py-4 shadow-sm dark:border-[#00E676]/[0.12]"
            key={id}
            onPress={() => onCategoryPress?.({ id, title, subtitle, Icon })}
          >
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
              <Icon color={colors.primary} size={25} strokeWidth={1.9} />
            </View>
            <Text
              className="w-full text-center font-vietnam text-label-md text-ink"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="mt-1 w-full text-center font-vietnam text-body-sm text-muted"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
