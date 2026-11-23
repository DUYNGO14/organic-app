import type { AppColors } from "@/hooks/use-app-colors";
import { AlarmClock, Leaf, RefreshCw, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const commitments = [
  { Icon: AlarmClock, title: "Thu hoạch tươi mỗi sáng", note: "Đóng gói nhanh để giữ độ giòn và hương vị tự nhiên." },
  { Icon: Leaf, title: "Canh tác theo tiêu chuẩn hữu cơ", note: "Ưu tiên phương pháp canh tác an toàn và bền vững." },
  { Icon: RefreshCw, title: "Hỗ trợ sau mua hàng", note: "Xem chính sách đổi trả và hoàn tiền trước khi đặt đơn." },
];

export function ProductCommitmentsCard({ colors }: { colors: AppColors }) {
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2"><ShieldCheck color={colors.primary} size={20} /><Text className="font-vietnam text-title-md text-ink">Cam kết canh tác tử tế</Text></View>
        <Text className="font-vietnam text-label-sm uppercase text-secondary">Chuẩn 3 không</Text>
      </View>
      {commitments.map(({ Icon, title, note }) => (
        <View key={title} className="mb-2.5 flex-row items-start gap-3 rounded-xl bg-surface-container-low p-3 last:mb-0">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container"><Icon color={colors.secondary} size={20} /></View>
          <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{title}</Text><Text className="mt-1 font-vietnam text-body-md text-muted">{note}</Text></View>
        </View>
      ))}
    </DetailCard>
  );
}
