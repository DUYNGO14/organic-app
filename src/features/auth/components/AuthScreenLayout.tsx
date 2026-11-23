import {
  IconButton,
  PrimaryBtn,
  type PrimaryBtnProps,
} from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Leaf } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenLayoutProps = {
  title: string;
  subtitle: ReactNode;
  onBack?: () => void;
  children: ReactNode;
};

export function AuthScreenLayout({
  title,
  subtitle,
  onBack,
  children,
}: AuthScreenLayoutProps) {
  const colors = useAppColors();
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
            <View className="w-full max-w-md grow justify-center gap-6 self-center px-4 py-6">
              <View className="items-center gap-3">
                {onBack ? (
                  <IconButton
                    className="absolute left-0 top-0 z-10 border border-card-border bg-surface/80"
                    icon={<ArrowLeft color={colors.ink} size={21} />}
                    label="Quay lại nhập số điện thoại"
                    onPress={onBack}
                    size="lg"
                  />
                ) : null}

                <View className="h-24 w-24 items-center justify-center rounded-full border border-on-photo/40 bg-surface/75">
                  <View className="h-[72px] w-[72px] items-center justify-center rounded-full border border-card-border bg-on-photo">
                    <Image
                      source={require("@/assets/images/logo.png")}
                      contentFit="contain"
                      style={styles.logo}
                    />
                  </View>
                  <View className="absolute bottom-1 right-1 h-6 w-6 items-center justify-center rounded-full border border-on-photo/40 bg-primary">
                    <Leaf color={colors.onPrimary} size={13} />
                  </View>
                </View>
                <Text className="text-center font-vietnam text-headline-sm text-primary">
                  ORGANIC VIỆT NAM
                </Text>
              </View>

              <View className="overflow-hidden rounded-xl border border-on-photo/30 bg-surface/90">
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
                <View className="gap-6 p-5">
                  <View className="gap-2">
                    <Text
                      accessibilityRole="header"
                      className="font-vietnam text-headline-lg-mobile text-ink"
                    >
                      {title}
                    </Text>
                    <Text className="font-vietnam text-body-md text-muted">
                      {subtitle}
                    </Text>
                  </View>
                  {children}
                </View>
              </View>

              <Text className="text-center font-vietnam text-body-sm text-muted">
                Nông sản sạch từ tâm
              </Text>
            </View>

            <View className="gap-1 px-4 pb-4">
              {appVersion ? (
                <Text className="text-center font-vietnam text-body-sm text-muted">
                  Phiên bản {appVersion}
                </Text>
              ) : null}
              <Pressable accessibilityRole="link" onPress={() => router.push("/legal/privacy")}>
                <Text className="text-center font-vietnam text-body-sm text-muted">
                  © 2026 ADIGO. Bảo mật và quyền riêng tư
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
  logo: { width: "80%", height: "80%" },
  scrollContent: { flexGrow: 1 },
});
