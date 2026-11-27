import { useAppTranslation } from "@/localization/content";
import { AppSheet } from "@/components/common/BottomSheet";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { History } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pointHistory } from "./profile.data";

const snapPoints = ["58%"];

export function PointHistorySheet({ onClose }: { onClose: () => void }) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const { bottom } = useSafeAreaInsets();

  return (
    <AppSheet
      header={{
        title: t("account.greenPointsHistory"),
        actionLabel: t("account.closePointsHistory"),
        subtitle: t("account.recentTransactions"),
        className: "gap-3",
        icon: (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
            <History color={colors.primary} size={20} />
          </View>
        ),
      }}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}>
        <View className="gap-3">
          {pointHistory.map(({ id, title, date, points, Icon }) => (
            <View key={id} className="flex-row items-center gap-3 rounded-lg bg-surface-soft p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-container">
                <Icon color={colors.primary} size={20} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-vietnam text-body-emphasis text-ink">{localize(title)}</Text>
                <Text className="font-vietnam text-body-sm text-muted">{date}</Text>
              </View>
              <Text className={`font-vietnam text-label-lg ${points > 0 ? "text-primary" : "text-danger"}`}>
                {points > 0 ? "+" : ""}{points}
              </Text>
            </View>
          ))}
        </View>
      </BottomSheetScrollView>
    </AppSheet>
  );
}
