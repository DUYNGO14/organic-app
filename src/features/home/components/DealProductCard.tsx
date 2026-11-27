import { useTranslation } from "react-i18next";
import { useAppTranslation } from "@/localization/content";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductCardBadges } from "@/components/product/product-card-badges";
import type { Product } from "@/types/product";
import { useAppColors } from "@/hooks/use-app-colors";
import { useCountdown } from "@/hooks/use-countdown";
import { Clock3 } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

type DealProductCardProps = {
  product: Product;
  className?: string;
  onPress?: (product: Product) => void;
  onAdd?: (product: Product) => void;
};

function SoldProgress({ percent }: { percent: number }) {
  const { t } = useTranslation();
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View>
      <View className="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
        <View
          className="h-full rounded-full bg-secondary"
          style={{ width: `${clampedPercent}%` }}
        />
      </View>
      <Text className="mt-1 text-right font-vietnam text-label-sm text-muted">
        {t("home.sold", { clampedPercent })}
      </Text>
    </View>
  );
}

export function DealProductCard({
  product,
  className,
  onPress,
  onAdd,
}: DealProductCardProps) {
  const { localize } = useAppTranslation();
  return (
    <ProductCard
      {...product}
      {...getProductCardBadges(product, { promotionLabel: product.badge })}
      className={className}
      meta={
        <Text className="font-vietnam text-label-md text-secondary" numberOfLines={1}>
          {localize(product.origin)}
        </Text>
      }
      footer={
        product.soldPercent !== undefined && !Number.isNaN(product.soldPercent)
          ? <SoldProgress percent={product.soldPercent} />
          : null
      }
      onPress={onPress && (() => onPress(product))}
      onAdd={onAdd && (() => onAdd(product))}
    />
  );
}

type DealSectionProps = {
  endsAt: number;
  products: Product[];
  onProductPress?: (product: Product) => void;
  onAddProduct?: (product: Product) => void;
};

function DealCountdown({ endsAt }: { endsAt: number }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { remainingSeconds } = useCountdown(endsAt);
  if (remainingSeconds === null) return null;

  const hours = Math.floor(remainingSeconds / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  const time = [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return (
    <View className="mb-1 flex-row items-center gap-1 rounded-xl bg-surface-container-lowest px-2.5 py-2 shadow-sm">
      <Clock3 color={colors.muted} size={14} />
      <Text
        accessibilityLabel={t("home.timeRemainingHrMinSec", { hours, minutes, seconds })}
        className="font-vietnam text-label-sm text-danger"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {time}
      </Text>
    </View>
  );
}

export function DealSection({
  endsAt,
  products,
  onProductPress,
  onAddProduct,
}: DealSectionProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-8">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View className="flex-1">
          <Text className="mb-1 font-vietnam text-label-sm font-bold uppercase tracking-wider text-primary">
            {t("home.earlyAccess")}</Text>
          <Text className="font-vietnam text-headline-sm text-ink">
            {t("home.harvestedThisMorning")}</Text>
        </View>
        <DealCountdown endsAt={endsAt} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 28,
          paddingBottom: 8,
        }}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        {products.map((product) => (
          <DealProductCard
            key={product.id}
            className="mr-3 w-[200px]"
            onPress={onProductPress}
            onAdd={onAddProduct}
            product={product}
          />
        ))}
      </ScrollView>
    </View>
  );
}
