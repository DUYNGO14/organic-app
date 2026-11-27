import { useTranslation } from "react-i18next";
import { PrimaryBtn } from "@/components/common";
import type { AppColors } from "@/hooks/use-app-colors";
import { Text, View } from "react-native";
import { ArrowRight, QrCode } from "lucide-react-native";

export function ProductTraceabilityCard({ colors, onScan }: { colors: AppColors; onScan: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface-container">
          <QrCode color={colors.primary} size={26} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-label-lg text-ink">{t("notifications.traceability")}</Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {t("products.seeTheFarmGrowingRegionAnd")}</Text>
        </View>
      </View>
      <PrimaryBtn
        fullWidth
        title={t("products.scanThePackaging")}
        variant="secondary"
        trailingIcon={<ArrowRight color={colors.primary} size={16} />}
        onPress={onScan}
      />
    </View>
  );
}
