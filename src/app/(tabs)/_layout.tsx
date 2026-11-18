import { BottomTabBar, MainHeader } from "@/components/layout";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainLayout() {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <MainHeader onProfileClick={() => router.navigate("/(tabs)/profile")} />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomTabBar />
    </SafeAreaView>
  );
}
