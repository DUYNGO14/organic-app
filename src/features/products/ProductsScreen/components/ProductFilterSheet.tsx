import { useAppTranslation } from "@/localization/content";
import { useTranslation } from "react-i18next";
import { AppSheet, SheetFooter, type AppSheetHandle } from "@/components/common/BottomSheet";
import { Checkbox, PrimaryBtn } from "@/components/common";
import { productCategories } from "@/features/products/catalog.data";
import type { PriceBandId } from "@/features/products/products.types";
import { cn } from "@/lib/cn";
import type { ProductCategoryId, SeasonFilterId } from "@/types/product";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
  { id: "all", label: "products.allSeasons" },
  { id: "in-season", label: "products.peakSeason" },
  { id: "cold-region", label: "products.coolClimateGreens" },
  { id: "early-harvest", label: "products.pickedEarlyToday" },
];

const priceBands: { id: PriceBandId; label: string }[] = [
  { id: "under-25", label: "products.under25000" },
  { id: "25-50", label: "products.2500050000" },
  { id: "50-100", label: "products.50000100000" },
  { id: "over-100", label: "products.over100000" },
];

const snapPoints = ["88%"];

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
  const { t } = useTranslation();
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
            <Text className="flex-1 font-vietnam text-body-md text-ink">{t(label)}</Text>
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
  const { t, localize } = useAppTranslation();
  const ref = useRef<AppSheetHandle>(null);
  const [draft, setDraft] = useState(filters);
  const dismiss = useCallback(() => ref.current?.dismiss(), []);

  return (
    <AppSheet
      header={{
        title: t("products.productFilters"),
        actionLabel: t("products.closeFilters"),
      }}
      ref={ref}
      fullWindowOnIOS
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onDismiss={onClose}
    >
      <BottomSheetScrollView
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="gap-5">
          <View>
            <Text accessibilityRole="header" className="mb-2 font-vietnam text-label-lg text-ink">
              {t("common.categories")}</Text>
            {productCategories.map(({ id, label }) => (
              <Checkbox
                key={id}
                checked={draft.categoryIds.includes(id)}
                label={localize(label)}
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
            title={t("products.season")}
            options={seasonOptions}
            value={draft.season}
            onSelect={(season) => setDraft((current) => ({ ...current, season }))}
          />

          {certifications.length > 0 ? (
            <View>
              <Text accessibilityRole="header" className="mb-2 font-vietnam text-label-lg text-ink">
                {t("products.certifications")}</Text>
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
            title={t("products.priceRange")}
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

      <SheetFooter className="flex-row flex-wrap items-center">
        <PrimaryBtn title={t("products.clearFilters")} variant="ghost" onPress={() => setDraft(emptyProductFilters)} />
        <PrimaryBtn
          className="min-w-40 flex-1"
          title={t("products.applyFilters")}
          onPress={() => {
            onApply(draft);
            dismiss();
          }}
        />
      </SheetFooter>
    </AppSheet>
  );
}
