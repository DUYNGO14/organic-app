import { PrimaryBtn } from "@/components/common";
import type { AppColors } from "@/hooks/use-app-colors";
import { Text, View } from "react-native";
import { ArrowRight, QrCode } from "lucide-react-native";

export function ProductTraceabilityCard({ colors, onScan }: { colors: AppColors; onScan: () => void }) {
  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface-container">
          <QrCode color={colors.primary} size={26} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-label-lg text-ink">Truy xuất nguồn gốc</Text>
          <Text className="font-vietnam text-body-sm text-muted">
            Xem nông trại, vùng trồng và thời điểm thu hoạch của từng lô.
          </Text>
        </View>
      </View>
      <PrimaryBtn
        fullWidth
        title="Quét mã trên bao bì"
        variant="secondary"
        trailingIcon={<ArrowRight color={colors.primary} size={16} />}
        onPress={onScan}
      />
    </View>
  );
}
