import { Checkbox, IconButton, PrimaryBtn } from "@/components/common";
import {
  productCategories,
  type ProductCategoryId,
  type SeasonFilterId,
} from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { BackHandler, Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";

export type PriceBandId = "under-25" | "25-50" | "50-100" | "over-100";
type SeasonFilterValue = SeasonFilterId | "all";

export type ProductFilters = {
  categoryIds: ProductCategoryId[];
  season: SeasonFilterValue;
  certifications: string[];
  priceBand: PriceBandId | null;
};

export const emptyProductFilters: ProductFilters = {
  categoryIds: [],
  season: "all",
  certifications: [],
  priceBand: null,
};

const seasonOptions: { id: SeasonFilterValue; label: string }[] = [
  { id: "all", label: "Tất cả vụ mùa" },
  { id: "in-season", label: "Đang vào mùa rộ" },
  { id: "cold-region", label: "Rau xứ lạnh" },
  { id: "early-harvest", label: "Hái sớm hôm nay" },
];

const priceBands: { id: PriceBandId; label: string }[] = [
  { id: "under-25", label: "Dưới 25.000đ" },
  { id: "25-50", label: "25.000đ – 50.000đ" },
  { id: "50-100", label: "50.000đ – 100.000đ" },
  { id: "over-100", label: "Trên 100.000đ" },
];

const snapPoints = ["88%"];

function FilterModalContainer({ children }: PropsWithChildren) {
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}

function FilterBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      accessible={false}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

function FilterBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      pointerEvents="none"
      className="rounded-t-lg border border-card-border bg-surface"
      style={style}
    />
  );
}

function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterOptions<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: readonly { id: T; label: string }[];
  value: T | null;
  onSelect: (id: T) => void;
}) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup">
      <Text accessibilityRole="header" className="font-vietnam text-label-lg text-ink">
        {title}
      </Text>
      {options.map(({ id, label }) => {
        const checked = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            className={cn(
              "min-h-12 flex-row items-center gap-3 rounded border px-3 py-2 active:bg-surface-container",
              checked ? "border-primary bg-primary/10" : "border-border bg-surface",
            )}
            onPress={() => onSelect(id)}
          >
            <View className={cn("h-5 w-5 items-center justify-center rounded-full border", checked ? "border-primary" : "border-border-strong")}>
              {checked ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
            </View>
            <Text className="flex-1 font-vietnam text-body-md text-ink">{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  const ref = useRef<BottomSheetModal>(null);
  const colors = useAppColors();
  const { top, bottom } = useSafeAreaInsets();
  const [draft, setDraft] = useState(filters);
  const dismiss = useCallback(() => ref.current?.dismiss(), []);

  useEffect(() => {
    Keyboard.dismiss();
    ref.current?.present();

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheetModal
      ref={ref}
      containerComponent={Platform.OS === "ios" ? FilterModalContainer : undefined}
      snapPoints={snapPoints}
      topInset={top}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      enablePanDownToClose
      backdropComponent={FilterBackdrop}
      backgroundComponent={FilterBackground}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      onDismiss={onClose}
    >
      <View className="flex-1" accessibilityViewIsModal onAccessibilityEscape={dismiss}>
        <View className="min-h-12 flex-row items-center gap-2 border-b border-border px-4 pb-2">
          <Text accessibilityRole="header" className="flex-1 font-vietnam text-title-md text-ink">
            Bộ lọc sản phẩm
          </Text>
          <IconButton
            icon={<X color={colors.ink} size={21} />}
            label="Đóng bộ lọc"
            size="lg"
            onPress={dismiss}
          />
        </View>

        <BottomSheetScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ padding: 16 }}
        >
          <View className="gap-5">
            <View>
              <Text accessibilityRole="header" className="mb-2 font-vietnam text-label-lg text-ink">
                Danh mục
              </Text>
              {productCategories.map(({ id, label }) => (
                <Checkbox
                  key={id}
                  checked={draft.categoryIds.includes(id)}
                  label={label}
                  onCheckedChange={() =>
                    setDraft((current) => ({
                      ...current,
                      categoryIds: toggleValue(current.categoryIds, id),
                    }))
                  }
                />
              ))}
            </View>

            <FilterOptions
              title="Mùa vụ"
              options={seasonOptions}
              value={draft.season}
              onSelect={(season) => setDraft((current) => ({ ...current, season }))}
            />

            {certifications.length > 0 ? (
              <View>
                <Text accessibilityRole="header" className="mb-2 font-vietnam text-label-lg text-ink">
                  Chứng nhận
                </Text>
                {certifications.map((certification) => (
                  <Checkbox
                    key={certification}
                    checked={draft.certifications.includes(certification)}
                    label={certification}
                    onCheckedChange={() =>
                      setDraft((current) => ({
                        ...current,
                        certifications: toggleValue(current.certifications, certification),
                      }))
                    }
                  />
                ))}
              </View>
            ) : null}

            <FilterOptions
              title="Khoảng giá"
              options={priceBands}
              value={draft.priceBand}
              onSelect={(priceBand) =>
                setDraft((current) => ({
                  ...current,
                  priceBand: current.priceBand === priceBand ? null : priceBand,
                }))
              }
            />
          </View>
        </BottomSheetScrollView>

        <View className="flex-row flex-wrap items-center gap-2 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: bottom + 12 }}>
          <PrimaryBtn title="Xóa lọc" variant="ghost" onPress={() => setDraft(emptyProductFilters)} />
          <PrimaryBtn
            className="min-w-40 flex-1"
            title="Áp dụng bộ lọc"
            onPress={() => {
              onApply(draft);
              dismiss();
            }}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}
