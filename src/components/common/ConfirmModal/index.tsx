import { useAppColors } from "@/hooks/use-app-colors";
import { CircleHelp, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryBtn } from "../Button";

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  icon?: LucideIcon;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({ visible, ...props }: ConfirmModalProps) {
  return visible ? <OpenConfirmModal {...props} /> : null;
}

function OpenConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Hủy",
  variant = "default",
  icon,
  errorMessage = "Không thể thực hiện thao tác. Vui lòng thử lại.",
  onClose,
  onConfirm,
}: Omit<ConfirmModalProps, "visible">) {
  const colors = useAppColors();
  const inFlight = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isDanger = variant === "danger";
  const Icon = icon ?? (isDanger ? TriangleAlert : CircleHelp);

  function requestClose() {
    if (!inFlight.current) onClose();
  }

  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true;
    setConfirming(true);
    setHasError(false);
    try {
      await onConfirm();
      onClose();
    } catch {
      setHasError(true);
    } finally {
      inFlight.current = false;
      setConfirming(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={requestClose}>
      <SafeAreaView className="flex-1 bg-photo-scrim/60">
        <View className="flex-1 items-center justify-center px-4 py-6">
          <Pressable
            style={StyleSheet.absoluteFill}
            aria-hidden
            accessible={false}
            disabled={confirming}
            onPress={requestClose}
          />
          <View
            accessibilityViewIsModal
            onAccessibilityEscape={requestClose}
            className="max-h-full w-full max-w-sm overflow-hidden rounded-lg border border-card-border bg-surface"
          >
            <ScrollView bounces={false} style={styles.scroll}>
              <View className="gap-5 p-5">
                <View
                  aria-hidden
                  className={`h-12 w-12 items-center justify-center rounded-full ${isDanger ? "bg-danger-container" : "bg-surface-container"}`}
                >
                  <Icon color={isDanger ? colors.danger : colors.primary} size={24} />
                </View>
                <View className="gap-2">
                  <Text accessibilityRole="header" className="font-vietnam text-headline-sm text-ink">
                    {title}
                  </Text>
                  {message ? <Text className="font-vietnam text-body-md text-muted">{message}</Text> : null}
                  {hasError ? (
                    <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">
                      {errorMessage}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <View className="min-w-0 grow basis-28">
                    <PrimaryBtn
                      fullWidth
                      title={cancelLabel}
                      variant="secondary"
                      disabled={confirming}
                      onPress={requestClose}
                    />
                  </View>
                  <View className="min-w-0 grow basis-28">
                    <PrimaryBtn
                      fullWidth
                      accessibilityLabel={confirmLabel}
                      title={confirmLabel}
                      variant={isDanger ? "danger" : "primary"}
                      loading={confirming}
                      onPress={() => void confirm()}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
});
