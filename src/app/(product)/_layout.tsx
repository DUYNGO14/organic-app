import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductLayout() {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
