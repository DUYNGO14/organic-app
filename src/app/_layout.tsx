import { StartupSplash } from "@/components/layout/StartupSplash";
import { getAuthReturnPath } from "@/features/auth/auth-return-path";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppProviders } from "@/providers/app-providers";
import { useAppStore } from "@/stores/app-store";
import { useFonts } from "expo-font";
import { useLinkingURL } from "expo-linking";
import { Stack, usePathname, useUnstableGlobalHref } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: false, duration: 0 });

const shouldShowStartupSplash = __DEV__;

export default function RootLayout() {
  const pathname = usePathname();
  const href = useUnstableGlobalHref();
  const linkingUrl = useLinkingURL();
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isBooting = useAuthStore((state) => state.status === "booting");
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
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const returnTo = getAuthReturnPath(href);
    if (returnTo) useAuthStore.setState({ returnTo });
  }, [href]);

  useEffect(() => {
    const returnTo = linkingUrl && getAuthReturnPath(linkingUrl);
    if (returnTo) useAuthStore.setState({ returnTo });
  }, [linkingUrl]);

  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (
      startupComplete ||
      !fontsReady ||
      isBooting ||
      !isThemeHydrated ||
      pathname === "/"
    )
      return;

    if (!shouldShowStartupSplash) {
      handOffSplash();
      const frame = requestAnimationFrame(() => setStartupComplete(true));
      return () => cancelAnimationFrame(frame);
    }

    if (!splashComplete) return;
    const frame = requestAnimationFrame(() => setStartupComplete(true));
    return () => cancelAnimationFrame(frame);
  }, [
    startupComplete,
    splashComplete,
    fontsReady,
    isBooting,
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
        {fontsReady && !isBooting ? <AuthNavigator /> : null}
      </AppProviders>
      {shouldShowStartupSplash && !startupComplete ? (
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
  const isAuthed = useAuthStore((state) => state.status === "authenticated");
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar barStyle="auto" />
      <Stack.Screen name="legal" />
      <Stack.Protected guard={!isAuthed && hasCompletedOnboarding}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthed && !hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(product)" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="scan-qr" />
      </Stack.Protected>
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
