import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function SectionHeading({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {icon}
      <Text className="min-w-0 flex-1 font-vietnam text-title-md text-ink">
        {title}
      </Text>
      {action}
    </View>
  );
}
