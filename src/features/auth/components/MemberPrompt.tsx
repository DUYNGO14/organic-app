import { PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { useAuthStore } from "@/features/auth/auth.store";
import { requestSignIn } from "@/features/auth/member-access";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function MemberPrompt({
  title,
  description,
  allowRegistration = false,
}: {
  title: string;
  description: string;
  allowRegistration?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="w-full max-w-md gap-4 self-center rounded-xl border border-card-border bg-surface p-4">
      <View className="gap-2">
        <Text accessibilityRole="header" className="font-vietnam text-headline-sm text-ink">{title}</Text>
        <Text className="font-vietnam text-body-md text-muted">{description}</Text>
      </View>
      <PrimaryBtn fullWidth title={t("auth.signIn")} onPress={() => requestSignIn()} />
      {allowRegistration ? (
        <PrimaryBtn
          fullWidth
          variant="secondary"
          title={t("auth.signUp")}
          onPress={() => router.push("/(auth)/register")}
        />
      ) : null}
    </View>
  );
}

export function MemberRoute({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  if (session) return children;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <StackHeader
        title={title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/home");
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}>
        <MemberPrompt title={t("auth.membersOnlyTitle")} description={t("auth.membersOnlyDescription")} />
      </ScrollView>
    </SafeAreaView>
  );
}
