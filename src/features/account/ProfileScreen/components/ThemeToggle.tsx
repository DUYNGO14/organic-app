import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/stores/app-store";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Monitor, Moon, Sun } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const themeOptions = [
  { mode: "light", Icon: Sun },
  { mode: "dark", Icon: Moon },
  { mode: "system", Icon: Monitor },
] as const;

export function ThemeOptions({
  selected,
  onSelect,
}: {
  selected: ThemeMode;
  onSelect: (value: ThemeMode) => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t("common.appearance")} className="flex-row gap-2">
      {themeOptions.map(({ mode, Icon }) => {
        const checked = mode === selected;
        const darkPreview = mode === "dark";
        const previewLineColor = darkPreview ? "bg-on-photo/25" : "bg-photo-scrim/20";
        const label = t(`common.${mode}`);

        return (
          <Pressable
            key={mode}
            accessibilityLabel={label}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            className={cn(
              "min-w-0 flex-1 rounded-lg border-2 bg-surface-soft p-2 active:bg-surface-container",
              checked ? "border-primary" : "border-transparent",
            )}
            onPress={() => onSelect(mode)}
          >
            <View
              className={cn(
                "mb-2 h-16 justify-between overflow-hidden rounded border border-border p-2",
                darkPreview ? "bg-photo-scrim" : "bg-on-photo",
              )}
            >
              {mode === "system" && (
                <LinearGradient
                  colors={[colors.onPhoto, colors.onPhoto, colors.photoScrim]}
                  locations={[0, 0.4, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View className="flex-row items-center justify-between gap-1">
                <View className={cn("h-1.5 w-5 rounded-full", darkPreview ? "bg-luminous" : "bg-secondary")} />
                <Icon color={mode === "light" ? colors.secondary : colors.onPhoto} size={12} />
              </View>
              <View className="gap-1">
                <View className={cn("h-1 w-full rounded-full", previewLineColor)} />
                <View className={cn("h-1 w-2/3 rounded-full", previewLineColor)} />
              </View>
            </View>
            <View className="flex-row items-start gap-1">
              <Text className="min-w-0 flex-1 font-vietnam text-body-emphasis text-ink">{label}</Text>
              {checked && (
                <View className="mt-1 h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check color={colors.onPrimary} size={12} />
                </View>
              )}
            </View>
            <Text className="font-vietnam text-body-sm text-muted">{t(`appearance.${mode}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
