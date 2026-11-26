import { AppSheet, type AppSheetHandle } from "@/components/common/BottomSheet";
import type { ProductSortId } from "@/features/products/products.types";
import { useAppColors } from "@/hooks/use-app-colors";
import { Check } from "lucide-react-native";
import { useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const sortOptions: { id: ProductSortId; label: string }[] = [
  { id: "harvest", label: "Mới hái nhất" },
  { id: "price-asc", label: "Giá thấp đến cao" },
  { id: "price-desc", label: "Giá cao đến thấp" },
];

type ProductSortSheetProps = {
  visible: boolean;
  selected: ProductSortId;
  onClose: () => void;
  onSelect: (sort: ProductSortId) => void;
};

export function ProductSortSheet({
  visible,
  selected,
  onClose,
  onSelect,
}: ProductSortSheetProps) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const sheet = useRef<AppSheetHandle>(null);
  const backdropStyle = useMemo(() => ({ backgroundColor: colors.ink }), [colors.ink]);

  if (!visible) return null;

  return (
    <AppSheet
      ref={sheet}
      backdropLabel="Đóng sắp xếp"
      backdropStyle={backdropStyle}
      backdropOpacity={0.4}
      fullWindowOnIOS
      hideHandle
      enableContentPanningGesture={false}
      onDismiss={onClose}
    >
      <View
        className="px-5 pt-5"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Text className="mb-3 font-vietnam text-headline-sm text-ink">
          Sắp xếp theo
        </Text>
        {sortOptions.map((option) => {
          const active = selected === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="min-h-12 flex-row items-center justify-between border-b border-border"
              onPress={() => {
                onSelect(option.id);
                sheet.current?.dismiss();
              }}
            >
              <Text
                className={`font-vietnam text-body-md ${active ? "text-primary" : "text-ink"}`}
              >
                {option.label}
              </Text>
              {active ? <Check color={colors.primary} size={19} /> : null}
            </Pressable>
          );
        })}
      </View>
    </AppSheet>
  );
}
