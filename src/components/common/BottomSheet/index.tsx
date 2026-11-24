import { IconButton } from "@/components/common/Button";
import { useAppColors } from "@/hooks/use-app-colors";
import { useBottomSheetBackHandler } from "@/hooks/use-bottom-sheet-back-handler";
import { cn } from "@/lib/cn";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  type BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { useIsFocused } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
} from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import { SheetInputFocusContext } from "./sheet-input-focus";

type SheetHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionLabel?: string;
  className?: string;
  onBack?: () => void;
  onDismiss: () => void;
};

type AppSheetProps = PropsWithChildren<{
  ref?: Ref<AppSheetHandle>;
  mode?: "modal" | "inline";
  snapPoints?: BottomSheetProps["snapPoints"];
  enableContentPanningGesture?: boolean;
  keyboardBehavior?: BottomSheetProps["keyboardBehavior"];
  fullWindowOnIOS?: boolean;
  backdropLabel?: string;
  backdropStyle?: StyleProp<ViewStyle>;
  backdropOpacity?: number;
  hideHandle?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  header?: Omit<SheetHeaderProps, "onBack" | "onDismiss">;
  onBack?: () => void;
  onDismiss: () => void;
}>;

export type AppSheetHandle = { dismiss: () => void };
const inlineSnapPoints = ["90%"];

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      pointerEvents="none"
      className="rounded-t-lg border border-card-border bg-surface"
      style={style}
    />
  );
}

function SheetWindow({ children }: PropsWithChildren) {
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}

export function AppSheet({
  ref,
  mode = "modal",
  snapPoints,
  enableContentPanningGesture,
  keyboardBehavior,
  fullWindowOnIOS,
  backdropLabel,
  backdropStyle,
  backdropOpacity,
  hideHandle,
  contentStyle,
  header,
  onBack,
  onDismiss,
  children,
}: AppSheetProps) {
  const modal = useRef<BottomSheetModal>(null);
  const inline = useRef<BottomSheet>(null);
  const closing = useRef(false);
  const dismissed = useRef(false);
  const focusedInput = useRef<string | null>(null);
  const keyboardAtTouchStart = useRef(false);
  const isFocused = useIsFocused();
  const colors = useAppColors();
  const { top } = useSafeAreaInsets();
  const sheetSnapPoints = snapPoints ?? (mode === "inline" ? inlineSnapPoints : undefined);

  const trackInputFocus = useCallback((id: string, focused: boolean) => {
    if (focused) focusedInput.current = id;
    else if (focusedInput.current === id) focusedInput.current = null;
  }, []);

  const keyboardIsActive = useCallback(
    () => focusedInput.current !== null || Keyboard.isVisible(),
    [],
  );

  const dismiss = useCallback(() => {
    if (closing.current || dismissed.current) return;
    closing.current = true;
    Keyboard.dismiss();
    if (mode === "inline") inline.current?.forceClose();
    else modal.current?.dismiss();
  }, [mode]);

  useImperativeHandle(ref, () => ({ dismiss }), [dismiss]);

  const finishDismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    onDismiss();
  }, [onDismiss]);

  useBottomSheetBackHandler(() => {
    if (closing.current || dismissed.current) return;
    if (keyboardIsActive()) Keyboard.dismiss();
    else if (onBack) onBack();
    else dismiss();
  }, isFocused);

  useEffect(() => {
    if (mode === "modal") modal.current?.present();
    const keyboardHide = Keyboard.addListener("keyboardDidHide", () => {
      // Android can hide the keyboard without blurring the native input.
      focusedInput.current = null;
    });
    return () => keyboardHide.remove();
  }, [mode]);

  const startBackdropTap = useCallback(() => {
    // Tapping outside the input can blur it before the press is released.
    keyboardAtTouchStart.current = keyboardIsActive();
  }, [keyboardIsActive]);

  const finishBackdropTap = useCallback(() => {
    const hideKeyboard = keyboardAtTouchStart.current || keyboardIsActive();
    keyboardAtTouchStart.current = false;
    if (hideKeyboard) Keyboard.dismiss();
    else dismiss();
  }, [dismiss, keyboardIsActive]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style, backdropStyle]}
        opacity={backdropOpacity}
        accessible={false}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="none"
      >
        <Pressable
          accessible={Boolean(backdropLabel)}
          accessibilityLabel={backdropLabel}
          accessibilityRole={backdropLabel ? "button" : undefined}
          style={StyleSheet.absoluteFill}
          onPressIn={startBackdropTap}
          onPress={finishBackdropTap}
        />
      </BottomSheetBackdrop>
    ),
    [backdropLabel, backdropOpacity, backdropStyle, finishBackdropTap, startBackdropTap],
  );

  const options = {
    snapPoints: sheetSnapPoints,
    topInset: top,
    enableDynamicSizing: !sheetSnapPoints,
    enableContentPanningGesture,
    enablePanDownToClose: !hideHandle,
    enableBlurKeyboardOnGesture: true,
    keyboardBehavior: keyboardBehavior ?? (mode === "inline" || Platform.OS === "android" ? "fillParent" : "interactive"),
    keyboardBlurBehavior: "restore",
    android_keyboardInputMode: "adjustResize",
    backdropComponent: renderBackdrop,
    backgroundComponent: SheetBackground,
    handleComponent: hideHandle ? null : undefined,
    handleIndicatorStyle: { backgroundColor: colors.muted },
  } satisfies Omit<BottomSheetProps, "children">;

  const accessibility = { accessibilityViewIsModal: true, onAccessibilityEscape: dismiss };
  const body = (
    <>
      {header ? <SheetHeader {...header} onBack={onBack} onDismiss={dismiss} /> : null}
      {children}
    </>
  );
  const content = (
    <SheetInputFocusContext.Provider value={trackInputFocus}>
      {sheetSnapPoints ? (
        <View {...accessibility} className="flex-1" style={contentStyle}>
          {body}
        </View>
      ) : (
        <BottomSheetView {...accessibility} style={contentStyle}>
          {body}
        </BottomSheetView>
      )}
    </SheetInputFocusContext.Provider>
  );

  return mode === "inline" ? (
    <BottomSheet {...options} ref={inline} onClose={finishDismiss}>
      {content}
    </BottomSheet>
  ) : (
    <BottomSheetModal
      {...options}
      ref={modal}
      containerComponent={fullWindowOnIOS && Platform.OS === "ios" ? SheetWindow : undefined}
      onDismiss={finishDismiss}
    >
      {content}
    </BottomSheetModal>
  );
}

export function SheetHeader({
  title,
  subtitle,
  icon,
  actionLabel,
  className,
  onBack,
  onDismiss,
}: SheetHeaderProps) {
  const colors = useAppColors();
  return (
    <View className={cn("min-h-12 flex-row items-center gap-2 border-b border-border px-4 pb-2", className)}>
      {icon}
      <View className="min-w-0 flex-1">
        <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">{title}</Text>
        {subtitle ? <Text className="font-vietnam text-body-sm text-muted">{subtitle}</Text> : null}
      </View>
      <NativeViewGestureHandler disallowInterruption>
        <View>
          <IconButton
            icon={onBack ? <ChevronLeft color={colors.ink} size={22} /> : <X color={colors.ink} size={21} />}
            label={actionLabel ?? (onBack ? "Quay lại" : "Đóng")}
            size="lg"
            onPress={() => {
              if (onBack) {
                Keyboard.dismiss();
                onBack();
              } else onDismiss();
            }}
          />
        </View>
      </NativeViewGestureHandler>
    </View>
  );
}

export function SheetFooter({
  children,
  className,
  bottomPadding = 12,
  guardGesture = false,
}: PropsWithChildren<{
  className?: string;
  bottomPadding?: number;
  guardGesture?: boolean;
}>) {
  const { bottom } = useSafeAreaInsets();
  const footer = (
    <View className={cn("gap-2 border-t border-border bg-surface px-4 pt-3", className)} style={{ paddingBottom: bottom + bottomPadding }}>
      {children}
    </View>
  );
  return guardGesture ? <NativeViewGestureHandler disallowInterruption>{footer}</NativeViewGestureHandler> : footer;
}
