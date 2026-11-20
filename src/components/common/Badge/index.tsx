import { BadgeCheck, Thermometer } from "lucide-react-native";
import { Text, View } from "react-native";

export type CertBadgeProps = {
  label: string;
  className?: string;
  showIcon?: boolean;
};

export function CertBadge({ label, className = "", showIcon = true }: CertBadgeProps) {
  return (
    <View
      accessibilityLabel={`Chứng nhận ${label}`}
      className={`min-h-7 flex-row items-center gap-1.5 self-start rounded-full border border-primary/15 bg-secondary-container px-2.5 py-1 dark:border-primary/30 dark:bg-primary/25 ${className}`}
    >
      {showIcon ? <BadgeCheck color="#006b35" size={14} /> : null}
      <Text className="font-vietnam text-label-sm text-on-secondary-container">
        {label}
      </Text>
    </View>
  );
}

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

export type StatusChipProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const statusStyles: Record<StatusTone, string> = {
  success: "bg-secondary-container dark:bg-primary/25",
  info: "bg-primary-container/10 dark:bg-primary/20",
  warning: "bg-[#fff4d6] dark:bg-[#5a4315]/50",
  danger: "bg-danger-container dark:bg-danger/15",
  neutral: "bg-surface-container dark:bg-surface-container-high",
};

const statusTextStyles: Record<StatusTone, string> = {
  success: "text-on-secondary-container",
  info: "text-primary",
  warning: "text-[#765000] dark:text-[#ffdc8a]",
  danger: "text-danger",
  neutral: "text-muted",
};

export function StatusChip({ label, tone = "neutral", className = "" }: StatusChipProps) {
  return (
    <View
      accessibilityLabel={`Trạng thái: ${label}`}
      className={`min-h-7 items-center justify-center self-start rounded-full px-2.5 py-1 ${statusStyles[tone]} ${className}`}
    >
      <Text className={`font-vietnam text-label-sm ${statusTextStyles[tone]}`}>{label}</Text>
    </View>
  );
}

export type TempBadgeProps = {
  temperature: number;
  unit?: string;
  tone?: "cold" | "fresh" | "warm";
  className?: string;
};

const tempBackgroundStyles = {
  cold: "bg-[#e8f4ff] dark:bg-[#163349]",
  fresh: "bg-secondary-container dark:bg-primary/25",
  warm: "bg-[#fff0df] dark:bg-[#462b16]",
} as const;

const tempTextStyles = {
  cold: "text-[#175788] dark:text-[#a9dcff]",
  fresh: "text-on-secondary-container",
  warm: "text-[#8a4300] dark:text-[#ffc58c]",
} as const;

export function TempBadge({
  temperature,
  unit = "°C",
  tone = "fresh",
  className = "",
}: TempBadgeProps) {
  return (
    <View
      accessibilityLabel={`Nhiệt độ ${temperature}${unit}`}
      className={`min-h-7 flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${tempBackgroundStyles[tone]} ${className}`}
    >
      <Thermometer color={tone === "warm" ? "#8a4300" : "#006b35"} size={14} />
      <Text className={`font-vietnam text-label-sm ${tempTextStyles[tone]}`}>
        {temperature}{unit}
      </Text>
    </View>
  );
}
