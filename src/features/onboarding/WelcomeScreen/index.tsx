import { PrimaryBtn } from "@/components/common";
import { LanguageToggle } from "@/features/account/ProfileScreen/components/LanguageToggle";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ArrowRight,
    ScanLine,
    ShieldCheck,
    Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("@/assets/images/logo-adiogo/adigo-logo.png");

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const colors = useAppColors();
  const [isStarting, setIsStarting] = useState(false);

  async function handleStart(destination: "/(tabs)/home" | "/(auth)/login") {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await completeOnboarding();
      router.replace(destination);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={
          colors.isDark
            ? [colors.canvas, colors.surface, colors.canvas]
            : [colors.canvas, colors.surfaceContainer, colors.canvas]
        }
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full"
        style={{
          backgroundColor: `${colors.logoStart}${colors.isDark ? "2E" : "14"}`,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full"
        style={{
          backgroundColor: `${colors.logoEnd}${colors.isDark ? "24" : "16"}`,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute right-9 top-[31%] h-24 w-24 rounded-full"
        style={{
          backgroundColor: `${colors.logoStart}${colors.isDark ? "18" : "0E"}`,
        }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerClassName="grow px-4 pb-4 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <View className="self-center overflow-hidden rounded-full border border-card-border bg-surface/85">
            <LinearGradient
              colors={[`${colors.logoStart}16`, `${colors.logoEnd}12`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="min-h-10 flex-row items-center gap-2 px-4 py-2">
              <Sparkles color={colors.logoEnd} size={16} />
              <Text className="font-vietnam text-label-sm text-ink">
                {t("onboarding.traceableProduce")}
              </Text>
            </View>
          </View>

          <View className="flex-1 justify-center py-6">
            <View className="overflow-hidden rounded-xl border border-card-border bg-surface/90 p-6">
              <LinearGradient
                pointerEvents="none"
                colors={[
                  `${colors.logoStart}20`,
                  `${colors.logoEnd}0A`,
                  `${colors.surface}00`,
                ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="items-center">
                <View
                  className="h-36 w-36 items-center justify-center rounded-full border border-card-border bg-surface"
                  style={{
                    shadowColor: colors.logoStart,
                    shadowOpacity: 0.12,
                    shadowRadius: 18,
                    elevation: 2,
                  }}
                >
                  <View
                    pointerEvents="none"
                    className="absolute h-28 w-28 rounded-full"
                    style={{
                      backgroundColor: `${colors.logoEnd}${colors.isDark ? "12" : "0A"}`,
                    }}
                  />
                  <Image
                    accessibilityLabel="Logo ADIGO"
                    contentFit="contain"
                    source={logo}
                    style={{ height: 104, width: 104 }}
                  />
                </View>
                <Text
                  accessibilityRole="header"
                  className="mt-6 font-vietnam text-display-lg"
                  style={{ color: colors.logoStart }}
                >
                  ADIGO
                </Text>
                <Text className="mt-3 max-w-[300px] text-center font-vietnam text-body-lg text-ink">
                  {t("onboarding.fromOrganicFarmsToHealthyMeals")}
                </Text>
                <Text className="mt-3 text-center font-vietnam text-body-md text-muted">
                  {t("onboarding.knowWhereYourFoodComesFrom")}
                </Text>
              </View>

              <View className="mt-7 flex-row gap-3 border-t border-border pt-5">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                    <ScanLine color={colors.logoStart} size={19} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-vietnam text-label-md text-ink">
                      {t("onboarding.easyToTrace")}
                    </Text>
                    <Text className="font-vietnam text-body-sm text-muted">
                      {t("onboarding.everyBatchOfProduce")}
                    </Text>
                  </View>
                </View>
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                    <ShieldCheck color={colors.logoEnd} size={19} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-vietnam text-label-md text-ink">
                      {t("onboarding.carefullySelected")}
                    </Text>
                    <Text className="font-vietnam text-body-sm text-muted">
                      {t("onboarding.forHomeCooking")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <LanguageToggle />
            <PrimaryBtn
              fullWidth
              className="min-h-[52px] rounded-xl"
              loading={isStarting}
              title={t("onboarding.exploreAsGuest")}
              trailingIcon={<ArrowRight color={colors.onPrimary} size={20} />}
              onPress={() => void handleStart("/(tabs)/home")}
            />
            <PrimaryBtn
              fullWidth
              disabled={isStarting}
              variant="secondary"
              title={t("auth.signIn")}
              onPress={() => void handleStart("/(auth)/login")}
            />
            <View className="flex-row flex-wrap items-center justify-center gap-x-4">
              <PrimaryBtn
                variant="ghost"
                title={t("auth.termsOfUse")}
                onPress={() => router.push("/legal/terms")}
              />
              <PrimaryBtn
                variant="ghost"
                title={t("auth.privacyPolicy")}
                onPress={() => router.push("/legal/privacy")}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
