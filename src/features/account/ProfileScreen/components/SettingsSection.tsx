import { PrimaryBtn } from "@/components/common";
import { SettingRow } from "@/components/common/SettingRow";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAppTranslation } from "@/localization/content";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Headphones, LogOut } from "lucide-react-native";
import { Linking, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { profileSettings } from "../profile.data";
import { PreferencesSheet } from "./PreferencesSheet";

export function SettingsSection({ onSignOut }: { onSignOut?: () => void }) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  function settingAction(id: string) {
    const messages: Record<string, string> = {
      traceability: t("account.traceabilityHistoryWillSyncWhenThe"),
      notifications: t("account.youReReceivingHarvestNotifications"),
      policy: "",
    };
    if (id === "policy") {
      router.push("/legal");
      return;
    }
    Toast.show({
      type: "info",
      text1: t("account.accountInformation"),
      text2: messages[id],
    });
  }

  return (
    <View className="gap-4">
      <View className="overflow-hidden rounded-xl border border-card-border bg-surface px-2">
        <PreferencesSheet />
        {profileSettings.filter(({ id }) => onSignOut || id === "policy").map(({ id, title, subtitle, Icon }) => (
          <SettingRow
            key={id}
            title={localize(title)}
            subtitle={localize(subtitle)}
            icon={Icon}
            divided
            onPress={() => settingAction(id)}
          />
        ))}

        <Pressable
          accessibilityRole="button"
          className="min-h-20 flex-row items-center gap-3 border-t border-border px-2 py-3 active:bg-surface-soft"
          onPress={() => Linking.openURL("tel:18006886")}
        >
          <View className="h-11 w-11 items-center justify-center rounded-md bg-secondary-container">
            <Headphones color={colors.secondary} size={21} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-vietnam text-body-emphasis text-ink">
              {t("account.adigoSupport18006886")}
            </Text>
            <Text className="font-vietnam text-body-sm text-secondary">
              {t("account.tollFree247")}
            </Text>
          </View>
          <Text className="font-vietnam text-label-md text-secondary">
            {t("account.callNow")}
          </Text>
        </Pressable>
      </View>

      {onSignOut ? <PrimaryBtn
        fullWidth
        title={t("account.signOut")}
        variant="secondary"
        leadingIcon={<LogOut color={colors.muted} size={18} />}
        className="bg-surface-container"
        labelClassName="text-muted"
        onPress={onSignOut}
      /> : null}

      <Text className="pb-2 text-center font-vietnam text-label-sm text-muted">
        {t("account.adigoVSupportingResponsibleFarming", { appVersion })}
      </Text>
    </View>
  );
}
