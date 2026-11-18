import { useAuthStore } from "@/features/auth/auth.store";
import { AppProviders } from "@/providers/app-providers";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const [fontsLoaded, fontError] = useFonts([
    {
      fontFamily: "BeVietnamPro",
      fontDefinitions: [
        {
          path: require("../../assets/fonts/BeVietnamPro-Regular.ttf"),
          weight: 400,
        },
        {
          path: require("../../assets/fonts/BeVietnamPro-Medium.ttf"),
          weight: 500,
        },
        {
          path: require("../../assets/fonts/BeVietnamPro-SemiBold.ttf"),
          weight: 600,
        },
        {
          path: require("../../assets/fonts/BeVietnamPro-Bold.ttf"),
          weight: 700,
        },
      ],
    },
  ]);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <AuthNavigator fontsReady={fontsLoaded || !!fontError} />
    </AppProviders>
  );
}

function AuthNavigator({ fontsReady }: { fontsReady: boolean }) {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  useEffect(() => {
    if (fontsReady && !isLoading) void SplashScreen.hideAsync();
  }, [fontsReady, isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session && hasCompletedOnboarding}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!session && !hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(product)" />
      </Stack.Protected>
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
