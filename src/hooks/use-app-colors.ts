import { useColorScheme } from "nativewind";

/** Lucide icons and native props need concrete colors rather than NativeWind classes. */
export function useAppColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    primary: isDark ? "#38C172" : "#006B35",
    onPrimary: isDark ? "#121614" : "#FFFFFF",
    secondary: "#58A500",
    ink: isDark ? "#F0FDF4" : "#000000",
    muted: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#2D3730" : "#E5E7EB",
    surface: isDark ? "#1A201C" : "#FFFFFF",
    surfaceRaised: isDark ? "#242C26" : "#F9FAF7",
    isDark,
  };
}
