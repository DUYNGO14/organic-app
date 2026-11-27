import { useAppTranslation } from "@/localization/content";
import type { PackageOption, Product } from "@/types/product";
import type { AppColors } from "@/hooks/use-app-colors";
import { BadgeCheck, Package, Star } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";
import { formatPrice } from "@/utils/format-price";

type ProductInfoCardProps = {
  product: Product;
  selectedPackage: PackageOption;
  packageIndex: number;
  discount: number;
  colors: AppColors;
};

export function ProductInfoCard({
  product,
  selectedPackage,
  packageIndex,
  discount,
  colors,
}: ProductInfoCardProps) {
  const { t, localize } = useAppTranslation();
  return (
    <DetailCard>
      <View className="mb-3 flex-row flex-wrap items-center gap-2">
        <View className="rounded-lg bg-secondary-container px-2.5 py-1">
          <Text className="font-vietnam text-label-sm text-on-secondary-container">
            {t("products.extraFreshGrade1")}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <BadgeCheck color={colors.primary} size={16} />
          <Text className="font-vietnam text-label-sm text-primary">
            {t("products.certifiedOrganic")}</Text>
        </View>
      </View>
      <Text className="font-vietnam text-headline-sm text-ink">
        {product.id === "kale"
          ? t("products.daLatHydroponicKaleExtraFresh")
          : localize(product.name)}
      </Text>
      <View className="mt-3 flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
        <Text className="font-vietnam text-headline-lg-mobile text-primary">
          {formatPrice(selectedPackage.price)}
        </Text>
        {selectedPackage.oldPrice ? (
          <Text className="font-vietnam text-body-md text-muted line-through">
            {formatPrice(selectedPackage.oldPrice)}
          </Text>
        ) : product.oldPrice && packageIndex === 0 ? (
          <Text className="font-vietnam text-body-md text-muted line-through">
            {formatPrice(product.oldPrice)}
          </Text>
        ) : null}
        {discount > 0 ? (
          <Text className="rounded bg-danger-container px-2 py-1 font-vietnam text-label-sm text-on-danger-container">
            -{discount}%
          </Text>
        ) : null}
      </View>
      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-y-2 border-t border-border pt-3">
        <View className="flex-row items-center gap-1">
          <Star color="#F59E0B" fill="#F59E0B" size={16} />
          <Text className="font-vietnam text-label-md text-ink">
            {(product.rating ?? 4.9).toFixed(1)}
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            ({product.reviewCount ?? 156} {t("products.reviews")}</Text>
        </View>
        <Text className="font-vietnam text-label-md text-muted">
          {t("products.12kSold")}</Text>
        <View className="flex-row items-center gap-1">
          <Package color={colors.secondary} size={15} />
          <Text className="font-vietnam text-label-sm text-secondary">
            {localize(selectedPackage.label)}
          </Text>
        </View>
      </View>
    </DetailCard>
  );
}
