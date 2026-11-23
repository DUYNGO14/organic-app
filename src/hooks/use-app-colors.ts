import { useColorScheme } from "nativewind";

export type AppColors = {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  ink: string;
  muted: string;
  danger: string;
  warning: string;
  cold: string;
  rating: string;
  border: string;
  canvas: string;
  surface: string;
  surfaceContainer: string;
  surfaceRaised: string;
  photoScrim: string;
  onPhoto: string;
  isDark: boolean;
};

/** Lucide icons and native props need concrete colors rather than NativeWind classes. */
export function useAppColors(): AppColors {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    primary: isDark ? "#38C172" : "#006B35",
    onPrimary: isDark ? "#121614" : "#FFFFFF",
    secondary: "#58A500",
    onSecondary: isDark ? "#121614" : "#FFFFFF",
    ink: isDark ? "#F0FDF4" : "#000000",
    muted: isDark ? "#94A3B8" : "#6B7280",
    danger: isDark ? "#FFB4AB" : "#BA1A1A",
    warning: isDark ? "#FCD34D" : "#92400E",
    cold: isDark ? "#7DD3FC" : "#075985",
    rating: isDark ? "#FBBF24" : "#F59E0B",
    border: isDark ? "#2D3730" : "#E5E7EB",
    canvas: isDark ? "#121614" : "#FFFFFF",
    surface: isDark ? "#1A201C" : "#FFFFFF",
    surfaceContainer: isDark ? "#242C26" : "#EBF6E9",
    surfaceRaised: isDark ? "#242C26" : "#F9FAF7",
    photoScrim: "#121614",
    onPhoto: "#FFFFFF",
    isDark,
  };
}
