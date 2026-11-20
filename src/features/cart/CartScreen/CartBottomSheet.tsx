import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { ChevronLeft, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import { BackHandler, Keyboard, Text, View } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const snapPoints = ["90%"];

export function SheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      accessible={false}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

export function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      pointerEvents="none"
      className="rounded-t-lg border border-card-border bg-surface"
      style={style}
    />
  );
}

export function CartBottomSheet({
  title,
  subtitle,
  icon,
  enableContentPanningGesture = true,
  onBack,
  onClose,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  enableContentPanningGesture?: boolean;
  onBack?: () => void;
  onClose: () => void;
}>) {
  const sheetRef = useRef<BottomSheet>(null);
  const { top } = useSafeAreaInsets();
  const colors = useAppColors();
  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    if (onBack) onBack();
    else sheetRef.current?.close();
  }, [onBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      topInset={top}
      enableDynamicSizing={false}
      enableContentPanningGesture={enableContentPanningGesture}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={SheetBackdrop}
      backgroundComponent={SheetBackground}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      onClose={onClose}
    >
      <View className="flex-1" accessibilityViewIsModal onAccessibilityEscape={dismiss}>
        <View className="min-h-12 flex-row items-center gap-2 border-b border-border px-4 pb-2">
          {icon}
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">
              {title}
            </Text>
            {subtitle ? (
              <Text className="font-vietnam text-body-sm text-muted">{subtitle}</Text>
            ) : null}
          </View>
          <NativeViewGestureHandler disallowInterruption>
            <View>
              <IconButton
                icon={onBack ? <ChevronLeft color={colors.ink} size={22} /> : <X color={colors.ink} size={21} />}
                label={onBack ? "Quay lại" : "Đóng"}
                size="lg"
                onPress={dismiss}
              />
            </View>
          </NativeViewGestureHandler>
        </View>
        {children}
      </View>
    </BottomSheet>
  );
}

export function CartSheetFooter({ children }: PropsWithChildren) {
  const { bottom } = useSafeAreaInsets();

  return (
    <NativeViewGestureHandler disallowInterruption>
      <View className="gap-2 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: bottom + 12 }}>
        {children}
      </View>
    </NativeViewGestureHandler>
  );
}
