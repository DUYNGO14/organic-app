import { i18n } from "@/localization";
import { useTranslation } from "react-i18next";
import { PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { LinearGradient } from "expo-linear-gradient";
import { router, useUnstableGlobalHref, type Href } from "expo-router";
import {
  ArrowLeft,
  Flag,
  Grid2X2,
  Headset,
  House,
  Leaf,
  RefreshCw,
  Search,
  Sprout,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const supportNumber = "1800 6886";

function ErrorIllustration() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const lift = useSharedValue(0);
  const floating = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value }] }));

  useEffect(() => {
    lift.value = withRepeat(
      withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
      undefined,
      ReduceMotion.System,
    );
    return () => cancelAnimation(lift);
  }, [lift]);

  return (
    <View
      accessibilityLabel={t("common.errorCode404")}
      accessibilityRole="image"
      accessible
      className="h-56 w-full items-center justify-center"
    >
      <View
        className="absolute h-56 w-full max-w-xs overflow-hidden rounded-full"
        pointerEvents="none"
      >
        <LinearGradient
          colors={[colors.canvas, colors.surfaceContainer, colors.canvas]}
          style={{ flex: 1 }}
        />
      </View>
      <View className="flex-row items-center justify-center gap-4">
        <View className="h-24 w-14 items-center justify-center">
          <Text className="font-vietnam text-display-xl text-primary" style={{ transform: [{ scale: 1.65 }] }}>
            4
          </Text>
          <View className="absolute right-0 top-0">
            <Leaf color={colors.secondary} fill={colors.secondary} size={21} />
          </View>
        </View>
        <View className="h-28 w-20 items-center justify-center">
          <View className="absolute bottom-1 h-3 w-14 rounded-full bg-primary/20" />
          <Animated.View style={floating}>
            <View className="h-20 w-14 items-center justify-center gap-1 rounded-full border border-card-border bg-surface">
              <Sprout color={colors.primary} size={24} />
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-ink" />
                <View className="h-1.5 w-1.5 rounded-full bg-ink" />
              </View>
              <View className="h-1.5 w-6 rounded-full bg-danger/20" />
              <View className="absolute -right-4 -top-2">
                <Search color={colors.primary} size={33} strokeWidth={1.5} />
              </View>
            </View>
          </Animated.View>
        </View>
        <View className="h-24 w-14 items-center justify-center">
          <Text className="font-vietnam text-display-xl text-primary" style={{ transform: [{ scale: 1.65 }] }}>
            4
          </Text>
          <View className="absolute -right-1 top-7">
            <Leaf color={colors.secondary} fill={colors.secondary} size={19} />
          </View>
        </View>
      </View>
    </View>
  );
}

type Shortcut = {
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
  color: string;
  onPress: () => void;
};

function ShortcutCard({ title, description, Icon, tone, color, onPress }: Shortcut) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      className="min-h-16 flex-1 flex-row items-center gap-2 rounded-lg border border-card-border bg-surface px-2 py-2 active:bg-surface-container"
      onPress={onPress}
    >
      <View className={cn("h-9 w-9 items-center justify-center rounded", tone)}>
        <Icon color={color} size={19} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-vietnam text-label-lg text-ink">{title}</Text>
        <Text className="font-vietnam text-body-sm text-muted">{description}</Text>
      </View>
    </Pressable>
  );
}

function callSupport() {
  void Linking.openURL("tel:18006886").catch(() => {
    Alert.alert(i18n.t("common.couldNotPlaceTheCall"), i18n.t("common.callAdigoAt", { supportNumber }));
  });
}

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const href = useUnstableGlobalHref();
  const signedIn = useAuthStore((state) => Boolean(state.session));

  function goToStart() {
    router.replace("/");
  }

  function openTab(path: "/(tabs)/categories" | "/(tabs)/orders") {
    if (signedIn) router.dismissTo(path);
    else goToStart();
  }

  const shortcutRows: Shortcut[][] = [
    [
      {
        title: t("common.home"),
        description: t("common.exploreTheNewHarvest"),
        Icon: House,
        tone: "bg-primary/10",
        color: colors.primary,
        onPress: goToStart,
      },
      {
        title: t("common.categories"),
        description: t("common.browseProduce"),
        Icon: Grid2X2,
        tone: "bg-secondary/20",
        color: colors.primary,
        onPress: () => openTab("/(tabs)/categories"),
      },
    ],
    [
      {
        title: t("common.orders"),
        description: t("common.trackYourDelivery"),
        Icon: Truck,
        tone: "bg-surface-container-high",
        color: colors.ink,
        onPress: () => openTab("/(tabs)/orders"),
      },
      {
        title: supportNumber,
        description: t("common.adigoSupport"),
        Icon: Headset,
        tone: "bg-danger-container",
        color: colors.danger,
        onPress: callSupport,
      },
    ],
  ];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView className="flex-1" contentContainerClassName="flex-grow justify-center px-4 py-6">
        <View className="w-full max-w-md self-center gap-5">
          <View className="items-center gap-3">
            <ErrorIllustration />
            <View className="flex-row items-center gap-2 rounded-full bg-primary/10 px-3 py-2">
              <Leaf color={colors.primary} size={16} />
              <Text className="shrink font-vietnam text-label-md text-primary">
                {t("common.harvestRotationInProgress")}</Text>
            </View>
            <Text accessibilityRole="header" className="text-center font-vietnam text-headline-sm text-ink">
              {t("common.pageNotFound")}</Text>
            <Text className="px-3 text-center font-vietnam text-body-md text-muted">
              {t("common.theLinkMayHaveBeenMoved")}</Text>
          </View>

          <View className="gap-2">
            <Text accessibilityRole="header" className="font-vietnam text-label-lg uppercase text-ink">
              {t("common.suggestedShortcuts")}</Text>
            <View className="gap-2">
              {shortcutRows.map(([first, second]) => (
                <View key={first.title} className="flex-row gap-2">
                  <ShortcutCard {...first} />
                  <ShortcutCard {...second} />
                </View>
              ))}
            </View>
          </View>

          <View className="gap-2">
            <PrimaryBtn
              fullWidth
              leadingIcon={<ArrowLeft color={colors.onPrimary} size={19} />}
              onPress={goToStart}
              title={t("common.goToAdigoHome")}
            />
            <View className="flex-row flex-wrap justify-center gap-x-1">
              <PrimaryBtn
                variant="ghost"
                className="px-2"
                labelClassName="text-label-md"
                leadingIcon={<Flag color={colors.primary} size={16} />}
                title={t("common.reportABrokenLink")}
                onPress={() => Alert.alert(
                  t("common.reportABrokenLink"),
                  t("common.reportTheProblemToAdigoSupport"),
                  [{ text: t("common.cancel"), style: "cancel" }, { text: t("common.call", { supportNumber }), onPress: callSupport }],
                )}
              />
              <PrimaryBtn
                variant="ghost"
                className="px-2"
                labelClassName="text-label-md"
                leadingIcon={<RefreshCw color={colors.primary} size={16} />}
                title={t("common.tryReloadingThePage")}
                onPress={() => router.replace(href as Href)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
