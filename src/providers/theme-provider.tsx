import { useAppStore } from "@/stores/app-store";
import { useColorScheme } from "nativewind";
import { useEffect, useLayoutEffect, type PropsWithChildren } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  const themeMode = useAppStore((state) => state.themeMode);
  const isThemeHydrated = useAppStore((state) => state.isThemeHydrated);
  const hydrateTheme = useAppStore((state) => state.hydrateTheme);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

  useLayoutEffect(() => {
    if (!isThemeHydrated) return;
    setColorScheme(themeMode);
  }, [isThemeHydrated, setColorScheme, themeMode]);

  return isThemeHydrated ? children : null;
}
