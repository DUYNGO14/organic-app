import { StartupSplash } from "@/components/layout/StartupSplash";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppProviders } from "@/providers/app-providers";
import { useAppStore } from "@/stores/app-store";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: false, duration: 0 });

export default function RootLayout() {
  const pathname = usePathname();
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isThemeHydrated = useAppStore((state) => state.isThemeHydrated);
  const nativeSplashHidden = useRef(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [startupComplete, setStartupComplete] = useState(false);
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

  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (
      startupComplete ||
      !splashComplete ||
      !fontsReady ||
      isLoading ||
      !isThemeHydrated ||
      pathname === "/"
    )
      return;
    const frame = requestAnimationFrame(() => setStartupComplete(true));
    return () => cancelAnimationFrame(frame);
  }, [
    startupComplete,
    splashComplete,
    fontsReady,
    isLoading,
    isThemeHydrated,
    pathname,
  ]);

  function handOffSplash() {
    if (nativeSplashHidden.current) return;
    SplashScreen.hide();
    nativeSplashHidden.current = true;
  }

  const completeSplash = useCallback(() => setSplashComplete(true), []);

  return (
    <View className="flex-1 bg-canvas" collapsable={false}>
      <AppProviders>
        {fontsReady && !isLoading ? <AuthNavigator /> : null}
      </AppProviders>
      {!startupComplete ? (
        <StartupSplash
          fontsReady={fontsReady}
          onReady={handOffSplash}
          onComplete={completeSplash}
        />
      ) : null}
    </View>
  );
}

function AuthNavigator() {
  const session = useAuthStore((state) => state.session);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar barStyle="auto" />
      <Stack.Protected guard={!session && hasCompletedOnboarding}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!session && !hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(product)" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="scan-qr" />
      </Stack.Protected>
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
