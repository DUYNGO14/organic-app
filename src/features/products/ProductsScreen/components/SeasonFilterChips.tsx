import type { SeasonFilterId } from "@/features/products/catalog.data";
import { Pressable, ScrollView, Text, View } from "react-native";

export type SeasonFilterValue = SeasonFilterId | "all";

const filters: { id: SeasonFilterValue; label: string; icon?: string }[] = [
  { id: "all", label: "Tất cả vụ mùa" },
  { id: "in-season", label: "Đang vào mùa rộ", icon: "🌾" },
  { id: "cold-region", label: "Rau xứ lạnh", icon: "❄️" },
  { id: "early-harvest", label: "Hái sớm hôm nay", icon: "🌿" },
];

type SeasonFilterChipsProps = {
  selected: SeasonFilterValue;
  onSelect: (filter: SeasonFilterValue) => void;
};

export function SeasonFilterChips({
  selected,
  onSelect,
}: SeasonFilterChipsProps) {
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
        {filters.map((filter) => {
          const active = filter.id === selected;
          return (
            <Pressable
              key={filter.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`flex-row items-center gap-1 rounded-full border px-3 ${active ? "border-primary/20 bg-primary/10" : "border-border bg-surface-container-lowest"}`}
              style={{ height: 48 }}
              onPress={() => onSelect(filter.id)}
            >
              {filter.icon ? (
                <Text className="text-body-sm">{filter.icon}</Text>
              ) : null}
              <Text
                className={`font-vietnam text-label-sm ${active ? "text-primary" : "text-ink"}`}
              >
                {filter.label}
              </Text>
              {filter.id === "in-season" ? (
                <Text className="rounded-full bg-secondary-container px-1.5 py-0.5 font-vietnam text-label-sm text-on-secondary-container">
                  Giá tốt
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
