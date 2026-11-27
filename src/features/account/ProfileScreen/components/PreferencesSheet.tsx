import { AppSheet, type AppSheetHandle } from "@/components/common/BottomSheet";
import { SettingRow } from "@/components/common/SettingRow";
import { setAppLanguage } from "@/localization";
import { useAppStore } from "@/stores/app-store";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Languages, Palette } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageOptions, languageNames } from "./LanguageToggle";
import { ThemeOptions } from "./ThemeToggle";

export function PreferencesSheet() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { height, fontScale } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const [active, setActive] = useState<"theme" | "language" | null>(null);
  const sheet = useRef<AppSheetHandle>(null);
  const language = i18n.resolvedLanguage === "en" ? "en" : "vi";
  const themeTitle = t("common.appearance");
  const languageTitle = t("language.title");
  const effectiveTheme = t(colorScheme === "dark" ? "common.dark" : "common.light");
  const themeSubtitle = themeMode === "system"
    ? t("common.deviceSetting", { effectiveTheme })
    : t(`common.${themeMode}`);
  const sheetHeight = Math.min(height * 0.85, 224 + 56 * fontScale + bottom);

  return (
    <>
      <SettingRow
        title={themeTitle}
        subtitle={themeSubtitle}
        icon={Palette}
        expanded={active === "theme"}
        onPress={() => setActive("theme")}
      />
      <SettingRow
        title={languageTitle}
        subtitle={languageNames[language]}
        icon={Languages}
        divided
        expanded={active === "language"}
        onPress={() => setActive("language")}
      />
      {active && (
        <AppSheet
          ref={sheet}
          snapPoints={[sheetHeight]}
          header={{ title: active === "theme" ? themeTitle : languageTitle }}
          backdropLabel={t("common.close")}
          fullWindowOnIOS
          enableContentPanningGesture={false}
          onDismiss={() => setActive(null)}
        >
          <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 16 }}>
            {active === "theme" ? (
              <ThemeOptions
                selected={themeMode}
                onSelect={(mode) => {
                  setThemeMode(mode);
                  sheet.current?.dismiss();
                }}
              />
            ) : (
              <LanguageOptions
                selected={language}
                onSelect={(value) => {
                  void setAppLanguage(value);
                  sheet.current?.dismiss();
                }}
              />
            )}
          </BottomSheetScrollView>
        </AppSheet>
      )}
    </>
  );
}
