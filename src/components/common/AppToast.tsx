import { useAppColors } from "@/hooks/use-app-colors";
import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { type ToastConfig, type ToastData } from "react-native-toast-message";

const toastTones = {
  success: { Icon: CircleCheck, color: "primary", badge: "bg-primary/10" },
  error: { Icon: CircleAlert, color: "danger", badge: "bg-danger-container" },
  info: { Icon: Info, color: "cold", badge: "bg-cold-container" },
} as const;

function ToastContent({ text1, text2, tone }: ToastData & { tone: keyof typeof toastTones }) {
  const colors = useAppColors();
  const { Icon, color, badge } = toastTones[tone];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion={tone === "error" ? "assertive" : "polite"}
      className="w-11/12 max-w-md flex-row items-center gap-3 rounded-lg border border-card-border bg-surface px-4 py-3"
    >
      <View className={`h-10 w-10 items-center justify-center rounded-full ${badge}`}>
        <Icon color={colors[color]} size={20} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-vietnam text-body-emphasis text-ink">{text1}</Text>
        {text2 ? (
          <Text className="font-vietnam text-body-sm text-muted">
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const toastConfig: ToastConfig = {
  success: (props) => <ToastContent {...props} tone="success" />,
  error: (props) => <ToastContent {...props} tone="error" />,
  info: (props) => <ToastContent {...props} tone="info" />,
};

export function AppToast() {
  const { top } = useSafeAreaInsets();
  return <Toast config={toastConfig} topOffset={top + 8} />;
}
