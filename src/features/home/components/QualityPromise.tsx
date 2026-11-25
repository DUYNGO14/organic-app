import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react-native";
import { Award, BadgeCheck, RefreshCw, Timer } from "lucide-react-native";
import { useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";

// Allow room for the longest note at the default text scale.
const minPromiseColumnWidth = 114;
const columnGap = 8;

const promises: {
  id: string;
  title: string;
  note?: string;
  Icon: LucideIcon;
}[] = [
  {
    id: "fresh",
    title: "Hái trong ngày",
    note: "Giao tươi ngon",
    Icon: Timer,
  },
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
  const { fontScale } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);
  const minGridWidth =
    minPromiseColumnWidth * Math.max(1, fontScale) * promises.length +
    columnGap * (promises.length - 1);
  const isCompact = contentWidth < minGridWidth;

  return (
    <View className="mx-4 mt-8 rounded-xl bg-surface-container-low p-4">
      <View className="mb-5 flex-row items-center gap-2">
        <Award color={colors.secondary} size={23} />
        <Text className="flex-1 font-vietnam text-label-lg text-primary">
          Cam kết chất lượng ADIGO
        </Text>
      </View>
      <View
        className={isCompact ? "gap-3" : "flex-row gap-2"}
        onLayout={({ nativeEvent }) =>
          setContentWidth(nativeEvent.layout.width)
        }
      >
        {promises.map(({ id, title, note, Icon }) => (
          <View
            className={cn(
              "items-center",
              isCompact ? "flex-row gap-3" : "flex-1 gap-2",
            )}
            key={id}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest">
              <Icon color={colors.primary} size={22} />
            </View>
            <View className={isCompact ? "flex-1" : "self-stretch"}>
              <Text
                className={cn(
                  "font-vietnam text-label-md text-ink",
                  !isCompact && "text-center",
                )}
              >
                {title}
              </Text>
              {note && (
                <Text
                  className={cn(
                    "mt-1 font-vietnam text-body-sm text-muted",
                    !isCompact && "text-center",
                  )}
                >
                  {note}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
