import { useAppTranslation } from "@/localization/content";
import { useTranslation } from "react-i18next";
import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Bell, BellOff, CheckCheck, ChevronRight, Package, ScanLine, ShoppingBasket } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { notifications, useNotificationStore, type AppNotification } from "./notifications.store";

const notificationKinds = {
  shopping: { label: "notifications.products", Icon: ShoppingBasket, tone: "bg-primary/10", color: "primary" },
  traceability: { label: "notifications.traceability", Icon: ScanLine, tone: "bg-cold-container", color: "cold" },
  orders: { label: "common.orders", Icon: Package, tone: "bg-warning-container", color: "warning" },
} as const;

const filters = [
  { id: "all", label: "home.all" },
  { id: "unread", label: "notifications.unread" },
] as const;

function NotificationCard({
  notification, unread, onPress,
}: {
  notification: AppNotification;
  unread: boolean;
  onPress: () => void;
}) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const { Icon, label, tone, color } = notificationKinds[notification.kind];
  const title = localize(notification.title);
  const body = localize(notification.body);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[unread ? t("notifications.unread") : t("notifications.read"), t(label), title, body].join(". ")}
      className={cn(
        "flex-row items-start gap-3 rounded-lg border bg-surface p-4 active:bg-surface-container",
        unread ? "border-primary/30" : "border-card-border",
      )}
      onPress={onPress}
    >
      <View className={cn("h-11 w-11 items-center justify-center rounded-full", tone)}>
        <Icon color={colors[color]} size={21} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          {unread ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
          <Text className="flex-1 font-vietnam text-label-sm text-muted">{t(label)}</Text>
        </View>
        <Text className="font-vietnam text-body-emphasis text-ink">{title}</Text>
        <Text className="font-vietnam text-body-sm text-muted">{body}</Text>
      </View>
      <View className="self-center">
        <ChevronRight color={colors.muted} size={16} />
      </View>
    </Pressable>
  );
}

function NotificationSeparator() {
  return <View className="h-3" />;
}

export default function NotificationsScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const readIds = useNotificationStore((state) => state.readIds);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unreadNotifications = notifications.filter(({ id }) => !readIds.includes(id));
  const unreadCount = unreadNotifications.length;
  const unreadOnly = filter === "unread";
  const EmptyIcon = unreadOnly ? BellOff : Bell;

  return (
    <SafeAreaView className="flex-1 bg-surface-soft">
      <StackHeader
        title={t("common.notifications")}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/home");
        }}
      />
      {isLoading ? (
        <ScreenSkeleton variant="notifications" />
      ) : (
        <>
          <View className="gap-2 border-b border-border bg-surface px-4 py-3">
            <View className="min-h-12 flex-row flex-wrap items-center justify-between gap-2">
              <Text accessibilityLiveRegion="polite" className="font-vietnam text-body-emphasis text-ink">
                {unreadCount ? t("notifications.unreadNotifications", { count: unreadCount }) : t("notifications.youReAllCaughtUp")}
              </Text>
              {unreadCount ? (
                <PrimaryBtn
                  variant="ghost"
                  className="px-2"
                  labelClassName="text-label-md"
                  title={t("notifications.markAllAsRead")}
                  leadingIcon={<CheckCheck color={colors.primary} size={16} />}
                  onPress={markAllRead}
                />
              ) : null}
            </View>
            <View className="flex-row gap-2" accessibilityRole="tablist">
              {filters.map(({ id, label }) => {
                const selected = filter === id;
                return (
                  <Pressable
                    key={id}
                    accessibilityLabel={t(label)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    className={cn(
                      "min-h-12 justify-center rounded-full border px-4",
                      selected ? "border-primary bg-primary/10" : "border-border bg-surface active:bg-surface-container",
                    )}
                    onPress={() => setFilter(id)}
                  >
                    <Text className={cn("font-vietnam text-label-md", selected ? "text-primary" : "text-muted")}>
                      {t(label)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <FlashList
            data={unreadOnly ? unreadNotifications : notifications}
            contentContainerStyle={{ padding: 16 }}
            keyExtractor={({ id }) => id}
            extraData={readIds}
            ItemSeparatorComponent={NotificationSeparator}
            renderItem={({ item }) => (
              <NotificationCard
                notification={item}
                unread={!readIds.includes(item.id)}
                onPress={() => {
                  markRead(item.id);
                  router.navigate(item.href);
                }}
              />
            )}
            ListEmptyComponent={
              <View className="items-center gap-3 px-4 py-12">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <EmptyIcon color={colors.primary} size={25} />
                </View>
                <Text className="text-center font-vietnam text-title-md text-ink">
                  {unreadOnly ? t("notifications.noUnreadNotifications") : t("notifications.noNotificationsYet")}
                </Text>
                {unreadOnly ? (
                  <PrimaryBtn className="self-center" title={t("cart.viewAll")} variant="ghost" onPress={() => setFilter("all")} />
                ) : null}
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}
