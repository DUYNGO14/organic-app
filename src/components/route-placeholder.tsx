import { Text, View } from "react-native";

export function RoutePlaceholder({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6">
      <Text className="font-vietnam text-headline-sm text-ink">{title}</Text>
      <Text className="mt-2 font-vietnam text-body-md text-muted">
        Trang đang được xây dựng.
      </Text>
    </View>
  );
}
