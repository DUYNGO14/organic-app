import { PrimaryBtn } from "@/components/common";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/features/auth/auth.store";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-canvas px-5 py-6">
      <Text className="font-vietnam text-headline-md text-ink">Tài khoản</Text>
      {session?.phone ? (
        <Text className="mt-2 font-vietnam text-body-md text-muted">
          Số điện thoại: +84 {session.phone}
        </Text>
      ) : null}
      <ThemeToggle />
      <PrimaryBtn
        className="mt-8 w-full"
        fullWidth
        onPress={() => void handleSignOut()}
        title="Đăng xuất"
        variant="secondary"
      />
    </View>
  );
}
