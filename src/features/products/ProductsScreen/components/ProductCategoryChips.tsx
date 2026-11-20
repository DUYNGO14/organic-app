import { Pressable, ScrollView, Text, View } from "react-native";
import type {
  ProductCategory,
  ProductCategoryId,
} from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";

type ProductCategoryChipsProps = {
  categories: ProductCategory[];
  selectedIds: ReadonlySet<ProductCategoryId>;
  onToggle: (id: ProductCategoryId) => void;
};

export function ProductCategoryChips({
  categories,
  selectedIds,
  onToggle,
}: ProductCategoryChipsProps) {
  const colors = useAppColors();

  return (
    <View
      className="border-b border-border bg-canvas"
      style={{ height: 56, flexGrow: 0, flexShrink: 0 }}
    >
      <ScrollView
        horizontal
        style={{ height: 56, flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
        }}
        showsHorizontalScrollIndicator={false}
      >
        {categories.map(({ id, label, count, Icon }) => {
          const selected = selectedIds.has(id);
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`flex-row items-center gap-1.5 rounded-full border px-3.5 ${selected ? "border-primary bg-primary" : "border-border bg-surface-container-lowest"}`}
              style={{ height: 48 }}
              onPress={() => onToggle(id)}
            >
              <Icon
                color={selected ? colors.onPrimary : colors.muted}
                fill={selected ? colors.onPrimary : "transparent"}
                size={18}
              />
              <Text
                className={`font-vietnam text-label-md ${selected ? "text-on-primary" : "text-ink"}`}
                numberOfLines={1}
              >
                {label}
              </Text>
              <View
                className={`ml-0.5 min-w-7 items-center rounded-full px-1.5 py-0.5 ${selected ? "bg-primary-container" : "bg-transparent"}`}
              >
                <Text
                  className={`font-vietnam text-label-sm ${selected ? "text-on-primary-container" : "text-muted"}`}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
