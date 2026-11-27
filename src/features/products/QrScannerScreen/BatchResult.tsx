import { useAppTranslation } from "@/localization/content";
import { getFormattingLocale } from "@/localization";
import { PrimaryBtn } from "@/components/common";
import { SkeletonBlock, SkeletonGroup } from "@/components/common/Skeleton";
import { useTraceabilityBatch } from "@/features/products/traceability.queries";
import { Text, View } from "react-native";

const harvestFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
};

export function BatchResult({
  batchCode,
  active,
  onOpenProduct,
}: {
  batchCode: string;
  active: boolean;
  onOpenProduct: (productId: string) => void;
}) {
  const { t, localize } = useAppTranslation();
  const query = useTraceabilityBatch(batchCode);

  if (query.isLoading) {
    return (
      <SkeletonGroup active={active} label={t("products.lookingUpOriginDetails")}>
        <View className="gap-4 rounded-lg border border-card-border bg-surface p-4">
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </View>
      </SkeletonGroup>
    );
  }

  if (query.data === undefined) {
    return (
      <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
        <Text accessibilityRole="alert" className="font-vietnam text-body-emphasis text-ink">
          {query.isPaused ? t("products.youReOffline") : t("products.couldNotLookUpTheOrigin")}
        </Text>
        <Text className="font-vietnam text-body-sm text-muted">
          {t("products.checkYourConnectionThenLookUp", { batchCode })}
        </Text>
        <PrimaryBtn
          title={t("cart.tryAgain")}
          loading={query.isFetching}
          variant="secondary"
          onPress={() => void query.refetch()}
        />
      </View>
    );
  }

  const batch = query.data;
  if (!batch) {
    return (
      <View className="gap-2 rounded-lg border border-card-border bg-surface p-4">
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="font-vietnam text-title-md text-ink">
          {t("products.batchNotFound", { batchCode })}
        </Text>
        <Text className="font-vietnam text-body-md text-muted">
          {t("products.checkTheCodeOnThePackaging")}</Text>
      </View>
    );
  }

  const details = [
    { label: t("products.batchCode"), value: batch.code },
    { label: t("common.farms"), value: batch.farmName },
    { label: t("products.growingRegion2"), value: batch.growingRegion },
    { label: t("products.harvest"), value: new Intl.DateTimeFormat(getFormattingLocale(), harvestFormatOptions).format(new Date(batch.harvestedAt)) },
  ];

  return (
    <>
      <View className="gap-4 rounded-lg border border-card-border bg-surface p-4">
        <Text className="self-start rounded-full bg-warning-container px-3 py-1 font-vietnam text-label-sm text-warning">
          {t("products.sampleData")}</Text>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="font-vietnam text-headline-sm text-ink">
          {localize(batch.productName)}
        </Text>
        {details.map(({ label, value }) => (
          <View key={label} className="gap-1 border-t border-border pt-3">
            <Text className="font-vietnam text-label-md text-muted">{label}</Text>
            <Text className="font-vietnam text-body-md text-ink">{value}</Text>
          </View>
        ))}
      </View>
      <PrimaryBtn fullWidth title={t("products.browseProducts")} onPress={() => onOpenProduct(batch.productId)} />
    </>
  );
}
