import { useTranslation } from "react-i18next";
import type { SocialProvider } from "@/features/auth/auth.service";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const providers = [
  {
    id: "google",
    label: "Google",
    logo: require("@/assets/images/auth/google.png"),
  },
  // { id: "facebook", label: "Facebook", logo: require("@/assets/images/auth/facebook.png") },
] as const;

type SocialLoginButtonsProps = {
  disabled: boolean;
  pending: SocialProvider | null;
  onSelect: (provider: SocialProvider) => void;
};

export function SocialLoginButtons({
  disabled,
  pending,
  onSelect,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const { primary } = useAppColors();

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="shrink text-center font-vietnam text-body-sm text-muted">
          {t("auth.orSignInWith")}</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      <View className="flex-row justify-center gap-4">
        {providers.map(({ id, label, logo }) => {
          const loading = pending === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={t("auth.signInWith", { label })}
              accessibilityState={{ disabled, busy: loading }}
              className={cn(
                "items-center justify-center flex-1  rounded-full border border-border bg-surface active:bg-surface-soft",
                disabled && !loading && "opacity-50",
              )}
              disabled={disabled}
              onPress={() => onSelect(id)}
            >
              {loading ? (
                <ActivityIndicator color={primary} />
              ) : (
                <View className="flex-row items-center gap-2 px-4 py-2">
                  <Image
                    source={logo}
                    style={styles.logo}
                    contentFit="contain"
                  />
                  <Text className="text-body-md font-vietnam text-muted">
                    {label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 24, height: 24 },
});
