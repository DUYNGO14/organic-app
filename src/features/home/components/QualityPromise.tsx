import { useAppColors } from "@/hooks/use-app-colors";
import type { LucideIcon } from "lucide-react-native";
import { Award, BadgeCheck, RefreshCw, Timer } from "lucide-react-native";
import { Text, View } from "react-native";

const promises: {
  id: string;
  title: string;
  note: string;
  Icon: LucideIcon;
}[] = [
  { id: "fresh", title: "Hái trong ngày", note: "Giao tươi ngon", Icon: Timer },
  {
    id: "trace",
    title: "Truy xuất 100%",
    note: "Mã QR từng lô",
    Icon: BadgeCheck,
  },
  {
    id: "return",
    title: "Đổi trả tận nơi",
    note: "Nếu không hài lòng",
    Icon: RefreshCw,
  },
];

export function QualityPromise() {
  const colors = useAppColors();

  return (
    <View className="mx-4 mt-8 rounded-xl bg-surface-container-low p-4">
      <View className="mb-5 flex-row items-center gap-2">
        <Award color={colors.secondary} size={23} />
        <Text className="flex-1 font-vietnam text-title-sm text-primary">
          Cam kết chất lượng ADIGO
        </Text>
      </View>
      <View className="flex-row justify-between gap-2">
        {promises.map(({ id, title, note, Icon }) => (
          <View className="flex-1 items-center" key={id}>
            <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest">
              <Icon color={colors.primary} size={22} />
            </View>
            <Text className="text-center font-vietnam text-label-md text-ink">
              {title}
            </Text>
            <Text className="mt-1 text-center font-vietnam text-body-sm text-muted">
              {note}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
