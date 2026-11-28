import ProfileScreen from "@/features/account/ProfileScreen";
import { SettingsSection } from "@/features/account/ProfileScreen/components/SettingsSection";
import { useAuthStore } from "@/features/auth/auth.store";
import { MemberPrompt } from "@/features/auth/components/MemberPrompt";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

export default function ProfileRoute() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  return session ? <ProfileScreen /> : (
    <ScrollView className="flex-1 bg-canvas" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="w-full max-w-md gap-4 self-center">
        <MemberPrompt
          title={t("account.guestTitle")}
          description={t("account.guestDescription")}
          allowRegistration
        />
        <SettingsSection />
      </View>
    </ScrollView>
  );
}
