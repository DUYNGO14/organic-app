import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import {
  Bell,
  ChevronDown,
  MapPin,
  ShoppingBag
} from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

export type MainHeaderProps = {
  userName?: string;
  currentAddress?: string;
  unreadNotificationsCount?: number;
  cartItemsCount?: number;
  userAvatarUrl?: string;
  onAddressClick?: () => void;
  onNotificationClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
};

function CountBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <View className="absolute -right-0.5 -top-0.5 min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-primary px-1 dark:border-surface-container-lowest">
      <Text className="font-vietnam text-[9px] font-bold text-on-primary">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}

export function MainHeader({
  userName = "Minh An",
  currentAddress = "Quận 1, TP. Hồ Chí Minh",
  unreadNotificationsCount = 0,
  cartItemsCount = 0,
  userAvatarUrl,
  onAddressClick,
  onNotificationClick,
  onCartClick,
  onProfileClick,
}: MainHeaderProps) {
  const colors = useAppColors();
  const iconColor = colors.isDark ? colors.ink : "#4B5563";

  return (
    <View className="min-h-[76px] flex-row items-center justify-between gap-2 rounded-b-lg border-b border-border bg-surface px-3 py-2 dark:border-border-strong dark:bg-surface-container-lowest">
      <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
        <View
          accessibilityLabel="Organic Việt Nam"
          className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container/50 dark:bg-primary/20"
        >
          <Image
            accessibilityLabel="Organic Việt Nam"
            className="h-full w-full"
            source={require("@/assets/images/logo.png")}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="font-vietnam text-body-sm text-ink"
          >
            Xin chào, {userName} 👋
          </Text>
          <Pressable
            accessibilityHint="Chọn địa chỉ giao hàng"
            accessibilityLabel={`Địa chỉ giao hàng: ${currentAddress}`}
            accessibilityRole="button"
            className="mt-0.5 min-w-0 flex-row items-center gap-1"
            hitSlop={6}
            onPress={onAddressClick}
          >
            <MapPin
              color={colors.isDark ? colors.primary : colors.secondary}
              size={14}
            />
            <Text
              numberOfLines={1}
              className="shrink font-vietnam text-label-md text-ink dark:text-on-surface"
            >
              Giao tới: {currentAddress}
            </Text>
            <ChevronDown color={iconColor} size={14} />
          </Pressable>
        </View>
      </View>

      <View className="shrink-0 flex-row items-center gap-0.5">
        <View className="relative">
          <IconButton
            icon={<Bell color={iconColor} size={20} />}
            label={
              unreadNotificationsCount > 0
                ? `Thông báo, ${unreadNotificationsCount} mục chưa đọc`
                : "Thông báo"
            }
            onPress={onNotificationClick}
            size="sm"
          />
          {unreadNotificationsCount > 0 ? (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full border border-surface bg-danger dark:border-surface-container-lowest" />
          ) : null}
        </View>

        <View className="relative">
          <IconButton
            icon={<ShoppingBag color={iconColor} size={20} />}
            label={
              cartItemsCount > 0
                ? `Giỏ hàng, ${cartItemsCount} sản phẩm`
                : "Giỏ hàng"
            }
            onPress={onCartClick}
            size="sm"
          />
          <CountBadge count={cartItemsCount} />
        </View>

        {/* <Pressable
          accessibilityLabel="Tài khoản"
          accessibilityRole="button"
          className="ml-1 h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary"
          onPress={onProfileClick}
        >
          {userAvatarUrl ? (
            <Image
              accessibilityLabel={`Ảnh đại diện ${userName}`}
              className="h-full w-full"
              source={{ uri: userAvatarUrl }}
            />
          ) : (
            <UserRound color="#ffffff" size={21} />
          )}
        </Pressable> */}
      </View>
    </View>
  );
}
