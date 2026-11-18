import { IconButton } from "@/components/common";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

export type StackHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
};

export function StackHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
}: StackHeaderProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#e0e3df" : "#3f4940";

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-border bg-surface px-4 dark:border-border-strong dark:bg-surface-container-lowest">
      <View className="w-11 items-start">
        {showBack ? (
          <IconButton
            icon={<ArrowLeft color={iconColor} size={20} />}
            label="Quay lại"
            onPress={onBack ?? (() => router.back())}
            size="sm"
            variant="outlined"
          />
        ) : null}
      </View>

      <Text
        className="mx-2 flex-1 text-center font-vietnam text-title-md text-ink dark:text-on-surface"
        numberOfLines={1}
      >
        {title}
      </Text>

      <View className="min-w-11 flex-row items-center justify-end gap-0.5">
        {rightAction ?? <View className="h-9 w-9" />}
      </View>
    </View>
  );
}
