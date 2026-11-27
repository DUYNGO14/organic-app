import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/cn";
import { setAppLanguage, supportedLanguages, type AppLanguage } from "@/localization";

export const languageNames: Record<AppLanguage, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

const languageFlags: Record<AppLanguage, number> = {
  vi: require("@/assets/images/flags/vn.png"),
  en: require("@/assets/images/flags/us.png"),
};

const languageOptions = supportedLanguages.map((value) => ({
  value,
  label: languageNames[value],
}));

export function LanguageOptions({
  selected,
  onSelect,
}: {
  selected: AppLanguage;
  onSelect: (value: AppLanguage) => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t("language.title")} className="gap-2">
      {languageOptions.map(({ value, label }) => {
        const checked = selected === value;
        const vietnamese = value === "vi";
        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked }}
            className={cn(
              "min-h-16 flex-row items-center gap-3 rounded-lg px-3 py-2 active:bg-surface-soft",
              checked && "bg-surface-container",
            )}
            onPress={() => onSelect(value)}
          >
            <View className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-soft">
              <Image
                accessible={false}
                source={languageFlags[value]}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                <Text className="font-vietnam text-body-emphasis text-ink">{label}</Text>
                {vietnamese && (
                  <Text className="rounded-full bg-primary-container px-2 py-0.5 font-vietnam text-label-sm text-on-primary-container">
                    {t("language.recommended")}
                  </Text>
                )}
              </View>
              <Text className="font-vietnam text-body-sm text-muted">{t(`language.${value}`)}</Text>
            </View>
            <View className={cn("h-5 w-5 items-center justify-center rounded-full", checked ? "bg-primary" : "bg-border")}>
              {checked && <Check color={colors.onPrimary} size={14} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const label = t("language.title");

  return (
    <View className="gap-2">
      <Text className="font-vietnam text-label-md text-ink">{label}</Text>
      <View
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        className="flex-row gap-1 rounded-lg bg-surface-soft p-1"
      >
        {languageOptions.map(({ value: language, label: name }) => {
          const selected = i18n.resolvedLanguage === language;
          return (
            <Pressable
              key={language}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={cn(
                "min-h-12 flex-1 items-center justify-center rounded-md border px-2 py-1",
                selected ? "border-primary bg-surface" : "border-transparent active:bg-surface",
              )}
              onPress={() => void setAppLanguage(language)}
            >
              <Text className={cn(
                "text-center font-vietnam text-label-md",
                selected ? "text-primary" : "text-muted",
              )}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
