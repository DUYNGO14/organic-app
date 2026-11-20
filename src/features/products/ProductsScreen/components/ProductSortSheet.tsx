import { Check } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { useAppColors } from "@/hooks/use-app-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ProductSortId = "harvest" | "price-asc" | "price-desc";

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

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Đóng sắp xếp"
          className="absolute inset-0 bg-ink/40"
          onPress={onClose}
        />
        <View
          className="rounded-t-3xl bg-surface-container-lowest px-5 pt-5"
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
                onPress={() => onSelect(option.id)}
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
      </View>
    </Modal>
  );
}
