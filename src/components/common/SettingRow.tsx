import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type SettingRowProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  divided?: boolean;
  expanded?: boolean;
  onPress: () => void;
};

export function SettingRow({
  title,
  subtitle,
  icon: Icon,
  divided,
  expanded,
  onPress,
}: SettingRowProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      className={cn(
        "min-h-20 flex-row items-center gap-3 px-2 py-3 active:bg-surface-soft",
        divided && "border-t border-border",
      )}
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
        <Icon color={colors.primary} size={20} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-vietnam text-body-emphasis text-ink">{title}</Text>
        <Text className="font-vietnam text-body-sm text-muted">{subtitle}</Text>
      </View>
      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}
