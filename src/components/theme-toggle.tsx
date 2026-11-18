import { useAppStore, type ThemeMode } from "@/stores/app-store";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";

const themeOptions: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Sáng" },
  { mode: "dark", label: "Tối" },
  { mode: "system", label: "Theo hệ thống" },
];

export function ThemeToggle() {
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const { colorScheme } = useColorScheme();
  const effectiveTheme = colorScheme === "dark" ? "Tối" : "Sáng";

  return (
    <View className="rounded-xl border border-border bg-surface p-4">
      <View className="mb-4">
        <Text className="font-vietnam text-title-md text-ink">Giao diện</Text>
        <Text className="mt-1 font-vietnam text-body-sm text-muted">
          {themeMode === "system"
            ? `Theo thiết bị · ${effectiveTheme}`
            : `Đang chọn ${themeMode === "dark" ? "Tối" : "Sáng"}`}
        </Text>
      </View>

      <View accessibilityRole="radiogroup" className="flex-row rounded-lg bg-surface-soft p-1">
        {themeOptions.map(({ mode, label }) => {
          const selected = themeMode === mode;
          return (
            <Pressable
              key={mode}
              accessibilityLabel={label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className="min-h-10 flex-1 items-center justify-center rounded-md border px-2"
              style={{
                backgroundColor: selected
                  ? colorScheme === "dark"
                    ? "#242C26"
                    : "#FFFFFF"
                  : "transparent",
                borderColor: selected
                  ? colorScheme === "dark"
                    ? "#38C172"
                    : "#006B35"
                  : "transparent",
              }}
              onPress={() => setThemeMode(mode)}
            >
              <Text
                className="text-center font-vietnam text-label-sm"
                style={{
                  color: selected
                    ? colorScheme === "dark"
                      ? "#38C172"
                      : "#006B35"
                    : colorScheme === "dark"
                      ? "#94A3B8"
                      : "#6B7280",
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
