import { PrimaryBtn, type PrimaryBtnProps } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Leaf } from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenLayoutProps = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  onCancel?: () => void;
};

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  onCancel,
}: AuthScreenLayoutProps) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 640;
  const appVersion = Constants.expoConfig?.version;

  return (
    <View className="flex-1 bg-canvas">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            `${colors.primary}40`,
            `${colors.primary}14`,
            `${colors.primary}00`,
          ]}
          locations={[0, 0.38, 0.74]}
          start={[0.12, 0]}
          end={[0.94, 0.9]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            `${colors.secondary}00`,
            `${colors.secondary}24`,
            `${colors.secondary}00`,
          ]}
          locations={[0.15, 0.55, 0.88]}
          start={[0.95, 0.12]}
          end={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[`${colors.primary}29`, `${colors.primary}00`]}
          locations={[0.04, 0.57]}
          start={[0, 0.9]}
          end={[0.7, 0.24]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              className={cn(
                "w-full grow justify-center gap-6 self-center py-6",
                wideLayout ? "max-w-[960px] px-6" : "max-w-md px-4",
              )}
            >
              <View className={wideLayout ? "flex-row items-stretch gap-5" : "gap-6"}>
                <View
                  className={cn(
                    "items-center justify-center gap-3",
                    wideLayout && "w-1/3 rounded-xl border border-card-border bg-surface-soft px-4 py-8",
                  )}
                >
                  <View className="h-28 w-28 items-center justify-center rounded-full border border-on-photo/40 bg-surface/75">
                    <View className="h-[88px] w-[88px] items-center justify-center rounded-full border border-card-border bg-on-photo">
                      <Image
                        source={require("@/assets/images/adigo-logo.png")}
                        contentFit="contain"
                        style={styles.logo}
                      />
                    </View>
                    <View className="absolute bottom-1 right-1 h-7 w-7 items-center justify-center rounded-full border border-on-photo/40 bg-primary">
                      <Leaf color={colors.onPrimary} size={14} />
                    </View>
                  </View>
                  <Text className={`text-center font-vietnam text-primary ${wideLayout ? "text-headline-lg" : "text-headline-sm"}`}>
                    ADIGO
                  </Text>
                  {wideLayout ? (
                    <Text className="text-center font-vietnam text-body-md text-muted">
                      {t("auth.responsiblyGrownProduce")}
                    </Text>
                  ) : null}
                </View>

                <View
                  className={cn(
                    "overflow-hidden rounded-xl border bg-surface/90",
                    wideLayout ? "min-w-0 flex-1 border-card-border" : "border-on-photo/30",
                  )}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={[
                      `${colors.onPhoto}16`,
                      `${colors.secondary}12`,
                      `${colors.secondary}00`,
                    ]}
                    locations={[0, 0.44, 1]}
                    start={[1, 0]}
                    end={[0.25, 0.86]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View className={cn("gap-6", wideLayout ? "p-6" : "p-5")}>
                    <View className="gap-2">
                      <Text
                        accessibilityRole="header"
                        className={`font-vietnam text-ink ${wideLayout ? "text-headline-lg" : "text-headline-lg-mobile"}`}
                      >
                        {title}
                      </Text>
                      <Text className="font-vietnam text-body-md text-muted">
                        {subtitle}
                      </Text>
                    </View>
                    {children}
                    {onCancel ? (
                      <PrimaryBtn variant="ghost" fullWidth title={t("auth.continueAsGuest")} onPress={onCancel} />
                    ) : null}
                  </View>
                </View>
              </View>

              {!wideLayout ? (
                <Text className="text-center font-vietnam text-body-sm text-muted">
                  {t("auth.responsiblyGrownProduce")}
                </Text>
              ) : null}
            </View>
            <View className="gap-1 px-4 pb-4">
              {appVersion ? (
                <Text className="text-center font-vietnam text-body-sm text-muted">
                  {t("auth.version", { appVersion })}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/legal/privacy")}
              >
                <Text className="text-center font-vietnam text-body-sm text-muted">
                  {t("auth.2026AdigoSecurityAndPrivacy")}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function AuthSubmitButton(props: PrimaryBtnProps) {
  const { onPhoto } = useAppColors();

  return (
    <View className="overflow-hidden rounded-lg bg-primary/10">
      <PrimaryBtn {...props} fullWidth />
      <LinearGradient
        pointerEvents="none"
        colors={[`${onPhoto}29`, `${onPhoto}00`]}
        locations={[0, 0.7]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: "86%", height: "86%" },
  scrollContent: { flexGrow: 1 },
});
