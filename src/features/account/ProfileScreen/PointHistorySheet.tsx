import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { History, X } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pointHistory } from "./profile.data";

const snapPoints = ["58%"];

function HistoryBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} accessible={false} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />;
}

function HistoryBackground({ style }: BottomSheetBackgroundProps) {
  return <View pointerEvents="none" className="rounded-t-lg border border-card-border bg-surface" style={style} />;
}

export function PointHistorySheet({ onClose }: { onClose: () => void }) {
  const sheet = useRef<BottomSheetModal>(null);
  const colors = useAppColors();
  const { top, bottom } = useSafeAreaInsets();
  const dismiss = useCallback(() => sheet.current?.dismiss(), []);

  useEffect(() => {
    sheet.current?.present();
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheetModal
      ref={sheet}
      snapPoints={snapPoints}
      topInset={top}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={HistoryBackdrop}
      backgroundComponent={HistoryBackground}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      onDismiss={onClose}
    >
      <View className="flex-1" accessibilityViewIsModal onAccessibilityEscape={dismiss}>
        <View className="min-h-12 flex-row items-center gap-3 border-b border-border px-4 pb-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
            <History color={colors.primary} size={20} />
          </View>
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">Lịch sử Điểm Xanh</Text>
            <Text className="font-vietnam text-body-sm text-muted">Các giao dịch gần đây</Text>
          </View>
          <IconButton icon={<X color={colors.ink} size={21} />} label="Đóng lịch sử điểm" size="lg" onPress={dismiss} />
        </View>

        <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}>
          <View className="gap-3">
            {pointHistory.map(({ id, title, date, points, Icon }) => (
              <View key={id} className="flex-row items-center gap-3 rounded-lg bg-surface-soft p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-container">
                  <Icon color={colors.primary} size={20} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-vietnam text-body-emphasis text-ink">{title}</Text>
                  <Text className="font-vietnam text-body-sm text-muted">{date}</Text>
                </View>
                <Text className={`font-vietnam text-label-lg ${points > 0 ? "text-primary" : "text-danger"}`}>
                  {points > 0 ? "+" : ""}{points}
                </Text>
              </View>
            ))}
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
