import { useState } from "react";
import { Checkbox, PrimaryBtn } from "@/components/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type PriceBandId = "under-25" | "25-50" | "50-100" | "over-100";

export type ProductFilters = {
  certifications: string[];
  priceBand: PriceBandId | null;
};

const priceBands: { id: PriceBandId; label: string }[] = [
  { id: "under-25", label: "Dưới 25.000đ" },
  { id: "25-50", label: "25.000đ – 50.000đ" },
  { id: "50-100", label: "50.000đ – 100.000đ" },
  { id: "over-100", label: "Trên 100.000đ" },
];

type ProductFilterSheetProps = {
  certifications: string[];
  filters: ProductFilters;
  onClose: () => void;
  onApply: (filters: ProductFilters) => void;
};

export function ProductFilterSheet({
  certifications,
  filters,
  onClose,
  onApply,
}: ProductFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ProductFilters>(() => ({
    certifications: [...filters.certifications],
    priceBand: filters.priceBand,
  }));

  function toggleCertification(certification: string) {
    setDraft((current) => {
      const selected = current.certifications.includes(certification);
      return {
        ...current,
        certifications: selected
          ? current.certifications.filter((item) => item !== certification)
          : [...current.certifications, certification],
      };
    });
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Đóng bộ lọc"
          className="absolute inset-0 bg-ink/40"
          onPress={onClose}
        />
        <View
          className="max-h-[88%] rounded-t-3xl bg-surface-container-lowest px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-vietnam text-headline-sm text-ink">
              Bộ lọc sản phẩm
            </Text>
            <Pressable
              accessibilityRole="button"
              className="min-h-12 justify-center px-2"
              onPress={() => {
                setDraft({ certifications: [], priceBand: null });
              }}
            >
              <Text className="font-vietnam text-label-md text-primary">
                Xóa lọc
              </Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-2 font-vietnam text-label-lg text-ink">
              Chứng nhận
            </Text>
            {certifications.map((certification) => (
              <Checkbox
                key={certification}
                checked={draft.certifications.includes(certification)}
                className="min-h-12"
                label={certification}
                onCheckedChange={() => toggleCertification(certification)}
              />
            ))}

            <Text className="mb-2 mt-4 font-vietnam text-label-lg text-ink">
              Khoảng giá
            </Text>
            <View className="gap-1">
              {priceBands.map(({ id, label }) => {
                const selected = draft.priceBand === id;
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`min-h-12 flex-row items-center rounded-lg border px-3 ${selected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        priceBand: selected ? null : id,
                      }))
                    }
                  >
                    <Text
                      className={`font-vietnam text-body-md ${selected ? "text-primary" : "text-ink"}`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <PrimaryBtn
            className="mt-4"
            fullWidth
            title="Áp dụng bộ lọc"
            onPress={() => onApply(draft)}
          />
        </View>
      </View>
    </Modal>
  );
}
