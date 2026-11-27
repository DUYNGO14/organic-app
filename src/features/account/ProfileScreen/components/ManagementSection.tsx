import { useAppColors } from "@/hooks/use-app-colors";
import { useAppTranslation } from "@/localization/content";
import { Image } from "expo-image";
import { router } from "expo-router";
import { CalendarDays, ChevronRight, ShoppingBag } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import {
    followedFarms,
    profileShortcuts,
    type ProfileShortcut,
} from "../profile.data";
import { SectionHeading } from "./SectionHeading";

function ShortcutCard({
  shortcut,
  onPress,
}: {
  shortcut: ProfileShortcut;
  onPress: () => void;
}) {
  const colors = useAppColors();
  const { Icon } = shortcut;
  const { localize } = useAppTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-36 min-w-0 flex-1 justify-between rounded-lg border border-card-border bg-surface p-4 active:bg-surface-soft"
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
        <Icon color={colors.primary} size={21} />
      </View>
      <View className="mt-3">
        <Text className="font-vietnam text-body-emphasis text-ink">
          {localize(shortcut.title)}
        </Text>
        <Text className="mt-1 font-vietnam text-body-sm text-muted">
          {localize(shortcut.subtitle)}
        </Text>
      </View>
    </Pressable>
  );
}

export function ManagementSection() {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();

  function openShortcut(shortcut: ProfileShortcut) {
    if (shortcut.id === "orders") router.navigate("/(tabs)/orders");
    else if (shortcut.id === "addresses") router.navigate("/address-book");
    else if (shortcut.id === "farms") router.navigate("/(tabs)/farm");
    else
      Toast.show({
        type: "info",
        text1: t("account.walletPayments"),
        text2: t("account.paymentMethodsWillBeAvailableWhen"),
      });
  }

  return (
    <View>
      <SectionHeading
        icon={<ShoppingBag color={colors.secondary} size={21} />}
        title={t("account.managePurchases")}
      />

      <Pressable
        accessibilityRole="button"
        className="mb-3 flex-row items-center gap-3 rounded-xl border border-card-border bg-surface p-4 active:bg-surface-soft"
        onPress={() => router.navigate("/(tabs)/orders")}
      >
        <View className="h-12 w-12 items-center justify-center rounded-md bg-secondary-container/50">
          <CalendarDays color={colors.secondary} size={22} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-vietnam text-body-emphasis text-ink">
            {t("account.scheduledDeliveryTuesdaysAndSaturdays")}
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {t("account.nextDeliveryTomorrowAt0730")}
          </Text>
        </View>
        <View className="rounded-full bg-secondary-container px-3 py-1.5">
          <Text className="font-vietnam text-label-sm text-on-secondary-container">
            {t("account.outForDelivery")}
          </Text>
        </View>
      </Pressable>

      <View className="gap-3">
        <View className="flex-row gap-3">
          {profileShortcuts.slice(0, 2).map((shortcut) => (
            <ShortcutCard
              key={shortcut.id}
              shortcut={shortcut}
              onPress={() => openShortcut(shortcut)}
            />
          ))}
        </View>
        <View className="flex-row gap-3">
          {profileShortcuts.slice(2).map((shortcut) => (
            <ShortcutCard
              key={shortcut.id}
              shortcut={shortcut}
              onPress={() => openShortcut(shortcut)}
            />
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-3 rounded-xl border border-card-border bg-surface p-4 active:bg-surface-soft"
        onPress={() => router.navigate("/(tabs)/farm")}
      >
        <View className="mb-3 flex-row items-center justify-between gap-2">
          <Text className="min-w-0 flex-1 font-vietnam text-label-md text-ink">
            {t("account.harvestsFromFarmsYouFollow")}
          </Text>
          <ChevronRight color={colors.muted} size={18} />
        </View>
        <View className="flex-row gap-3">
          {followedFarms.map((farm, index) => (
            <View
              key={farm.id}
              className={`min-w-0 flex-1 flex-row items-center gap-2 ${index ? "border-l border-border pl-3" : ""}`}
            >
              <View className="h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                <Image
                  source={farm.image}
                  contentFit="cover"
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="font-vietnam text-label-md text-ink"
                >
                  {farm.name}
                </Text>
                <Text
                  numberOfLines={2}
                  className="font-vietnam text-label-sm text-primary"
                >
                  {localize(farm.status)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}
