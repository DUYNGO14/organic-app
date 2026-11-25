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
  shopping: { label: "Sản phẩm", Icon: ShoppingBasket, tone: "bg-primary/10", color: "primary" },
  traceability: { label: "Truy xuất nguồn gốc", Icon: ScanLine, tone: "bg-cold-container", color: "cold" },
  orders: { label: "Đơn hàng", Icon: Package, tone: "bg-warning-container", color: "warning" },
} as const;

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" },
] as const;

function NotificationCard({
  notification, unread, onPress,
}: {
  notification: AppNotification;
  unread: boolean;
  onPress: () => void;
}) {
  const colors = useAppColors();
  const { Icon, label, tone, color } = notificationKinds[notification.kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[unread ? "Chưa đọc" : "Đã đọc", label, notification.title, notification.body].join(". ")}
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
          <Text className="flex-1 font-vietnam text-label-sm text-muted">{label}</Text>
        </View>
        <Text className="font-vietnam text-body-emphasis text-ink">{notification.title}</Text>
        <Text className="font-vietnam text-body-sm text-muted">{notification.body}</Text>
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
        title="Thông báo"
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
                {unreadCount ? `${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
              </Text>
              {unreadCount ? (
                <PrimaryBtn
                  variant="ghost"
                  className="px-2"
                  labelClassName="text-label-md"
                  title="Đọc tất cả"
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
                    accessibilityLabel={label}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    className={cn(
                      "min-h-12 justify-center rounded-full border px-4",
                      selected ? "border-primary bg-primary/10" : "border-border bg-surface active:bg-surface-container",
                    )}
                    onPress={() => setFilter(id)}
                  >
                    <Text className={cn("font-vietnam text-label-md", selected ? "text-primary" : "text-muted")}>
                      {label}
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
                  {unreadOnly ? "Không còn thông báo chưa đọc" : "Chưa có thông báo"}
                </Text>
                {unreadOnly ? (
                  <PrimaryBtn className="self-center" title="Xem tất cả" variant="ghost" onPress={() => setFilter("all")} />
                ) : null}
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}
