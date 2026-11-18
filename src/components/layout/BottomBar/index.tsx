import { router, usePathname, type Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  Sprout,
  UserRound,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type TabKey = "home" | "categories" | "farm" | "orders" | "profile";

export type TabItem = {
  key: TabKey;
  label: string;
  icon: (active: boolean) => ReactNode;
  badge?: number | boolean;
  href: Href;
};

export type BottomTabBarProps = {
  currentTab?: TabKey;
  onChangeTab?: (key: TabKey) => void;
  orderBadge?: number | boolean;
};

const tabDefinitions: {
  key: TabKey;
  label: string;
  href: Href;
  Icon: LucideIcon;
}[] = [
  { key: "home", label: "Trang chủ", href: "/(tabs)/home", Icon: Home },
  {
    key: "categories",
    label: "Danh mục",
    href: "/(tabs)/categories",
    Icon: LayoutGrid,
  },
  { key: "farm", label: "Nông trại", href: "/(tabs)/farm", Icon: Sprout },
  {
    key: "orders",
    label: "Đơn hàng",
    href: "/(tabs)/orders",
    Icon: ClipboardList,
  },
  {
    key: "profile",
    label: "Tài khoản",
    href: "/(tabs)/profile",
    Icon: UserRound,
  },
];

const TAB_INDICATOR_WIDTH = 56;
const TAB_SPRING = {
  damping: 18,
  stiffness: 190,
  mass: 0.65,
  reduceMotion: ReduceMotion.System,
} as const;

function TabIcon({
  Icon,
  active,
  color,
  fill,
}: {
  Icon: LucideIcon;
  active: boolean;
  color: string;
  fill: string;
}) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: withSpring(active ? 1.06 : 1, TAB_SPRING) }],
    }),
    [active],
  );

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        color={color}
        fill={fill}
        size={22}
        strokeWidth={active ? 2.3 : 1.8}
      />
    </Animated.View>
  );
}

function RouteBadge({ badge }: { badge?: number | boolean }) {
  if (!badge) return null;

  if (typeof badge === "boolean") {
    return (
      <View className="absolute right-1 top-1 h-2 w-2 rounded-full border border-surface bg-secondary dark:border-surface-container-lowest dark:bg-primary" />
    );
  }

  return (
    <View className="absolute -right-1 -top-1 min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 dark:bg-primary">
      <Text className="font-vietnam text-[9px] font-bold text-on-primary">
        {badge > 99 ? "99+" : badge}
      </Text>
    </View>
  );
}

export function BottomTabBar({
  currentTab,
  onChangeTab,
  orderBadge = false,
}: BottomTabBarProps) {
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const activeKey =
    currentTab ??
    tabDefinitions.find((tab) => pathname.endsWith(`/${tab.key}`))?.key ??
    "home";
  const activeIndex = Math.max(
    0,
    tabDefinitions.findIndex((tab) => tab.key === activeKey),
  );
  const activeColor = colorScheme === "dark" ? "#38c172" : "#006b35";
  const inactiveColor = colorScheme === "dark" ? "#94a3b8" : "#6b7280";
  const containerWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => {
    const innerWidth = Math.max(0, containerWidth.value - 10);
    const itemWidth = innerWidth / tabDefinitions.length;
    const translateX =
      5 + itemWidth * activeIndex + (itemWidth - TAB_INDICATOR_WIDTH) / 2;

    return {
      transform: [{ translateX: withSpring(translateX, TAB_SPRING) }],
    };
  }, [activeIndex]);

  return (
    <View
      className="z-10 mx-3 mb-3 flex-row items-center justify-around rounded-3xl border border-border bg-surface px-1 pb-1 pt-2 dark:border-primary/35 dark:bg-[#2d3730]"
      onLayout={({ nativeEvent }) => {
        containerWidth.value = nativeEvent.layout.width;
      }}
      style={{
        elevation: 8,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: colorScheme === "dark" ? 0.2 : 0.07,
        shadowRadius: 12,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            top: 9,
            width: TAB_INDICATOR_WIDTH,
            height: 36,
            borderRadius: 16,
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(56, 193, 114, 0.2)"
                : "rgba(88, 165, 0, 0.2)",
          },
          indicatorStyle,
        ]}
      />

      {tabDefinitions.map(({ key, label, href, Icon }) => {
        const active = activeKey === key;
        const iconColor = active ? activeColor : inactiveColor;
        const iconFill = key === "home" && active ? activeColor : "none";
        const badge = key === "orders" ? orderBadge : undefined;

        return (
          <Pressable
            key={key}
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className="min-h-12 flex-1 items-center justify-center gap-0.5 py-1"
            onPress={() => {
              onChangeTab?.(key);
              router.replace(href);
            }}
          >
            <View className="relative h-9 w-14 items-center justify-center rounded-lg">
              <TabIcon
                Icon={Icon}
                active={active}
                color={iconColor}
                fill={iconFill}
              />
              <RouteBadge badge={badge} />
            </View>
            {active ? (
              <Text className="font-vietnam text-label-sm text-primary">
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
