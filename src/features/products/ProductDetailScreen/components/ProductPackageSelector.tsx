import { useAppTranslation } from "@/localization/content";
import { StepperBtn } from "@/components/common";
import type { ProductDetailSpec } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Pressable, Text, View } from "react-native";
import { DetailCard } from "./DetailCard";
import { formatPrice } from "@/utils/format-price";

type ProductPackageSelectorProps = {
  spec: ProductDetailSpec;
  packageIndex: number;
  onPackageChange: (index: number) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  colors: AppColors;
};

export function ProductPackageSelector({ spec, packageIndex, onPackageChange, quantity, onQuantityChange, colors }: ProductPackageSelectorProps) {
  const { t, localize } = useAppTranslation();
  const selectedPackage = spec.packages[packageIndex] ?? spec.packages[0];

  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-vietnam text-body-emphasis text-ink">{t("products.packageWeight")}</Text>
        <Text className="font-vietnam text-label-sm text-primary">{localize(selectedPackage.label)} · {localize(selectedPackage.note)}</Text>
      </View>
      <View className="flex-row gap-2">
        {spec.packages.map((option, index) => {
          const selected = packageIndex === index;
          return (
            <Pressable key={option.label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => onPackageChange(index)} className="min-h-[68px] flex-1 items-center justify-center rounded-xl border px-1 py-2" style={{ backgroundColor: selected ? colors.primary : colors.surfaceRaised, borderColor: selected ? colors.primary : colors.border }}>
              <Text className="font-vietnam text-body-emphasis" style={{ color: selected ? colors.onPrimary : colors.ink }}>{localize(option.label)}</Text>
              <Text className="mt-1 font-vietnam text-body-sm" style={{ color: selected ? colors.onPrimary : colors.muted }}>{formatPrice(option.price)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-vietnam text-body-emphasis text-ink">{t("products.selectAQuantity")}</Text>
        <StepperBtn label={t("products.itemQuantity")} value={quantity} min={1} onValueChange={onQuantityChange} />
      </View>
    </DetailCard>
  );
}
