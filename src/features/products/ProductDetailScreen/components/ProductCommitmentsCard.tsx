import { useTranslation } from "react-i18next";
import type { AppColors } from "@/hooks/use-app-colors";
import { AlarmClock, Leaf, RefreshCw, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const commitments = [
  { Icon: AlarmClock, title: "products.freshlyHarvestedEveryMorning", note: "products.packedPromptlyToPreserveCrispnessAnd" },
  { Icon: Leaf, title: "products.grownToOrganicStandards", note: "products.wePrioritizeSafeAndSustainableGrowing" },
  { Icon: RefreshCw, title: "products.afterSalesSupport", note: "products.reviewTheReturnsAndRefundsPolicy" },
];

export function ProductCommitmentsCard({ colors }: { colors: AppColors }) {
  const { t } = useTranslation();
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2"><ShieldCheck color={colors.primary} size={20} /><Text className="font-vietnam text-title-md text-ink">{t("products.ourFarmingCommitments")}</Text></View>
        <Text className="font-vietnam text-label-sm uppercase text-secondary">{t("products.threeGrowingCommitments")}</Text>
      </View>
      {commitments.map(({ Icon, title, note }) => (
        <View key={t(title)} className="mb-2.5 flex-row items-start gap-3 rounded-xl bg-surface-container-low p-3 last:mb-0">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container"><Icon color={colors.secondary} size={20} /></View>
          <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{t(title)}</Text><Text className="mt-1 font-vietnam text-body-md text-muted">{t(note)}</Text></View>
        </View>
      ))}
    </DetailCard>
  );
}
