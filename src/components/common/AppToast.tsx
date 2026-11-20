import { useAppColors } from "@/hooks/use-app-colors";
import { CircleAlert, CircleCheck } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { type ToastConfig, type ToastData } from "react-native-toast-message";

function ToastContent({ text1, text2, error = false }: ToastData & { error?: boolean }) {
  const colors = useAppColors();
  const Icon = error ? CircleAlert : CircleCheck;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="w-11/12 max-w-md flex-row items-center gap-3 rounded-lg border border-card-border bg-surface px-4 py-3"
    >
      <Icon color={error ? colors.danger : colors.primary} size={22} />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-vietnam text-body-emphasis text-ink">{text1}</Text>
        {text2 ? (
          <Text className="font-vietnam text-body-sm text-muted" numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const toastConfig: ToastConfig = {
  success: (props) => <ToastContent {...props} />,
  error: (props) => <ToastContent {...props} error />,
};

export function AppToast() {
  const { top } = useSafeAreaInsets();
  return <Toast config={toastConfig} topOffset={top + 8} />;
}
