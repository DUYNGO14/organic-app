import { useTranslation } from "react-i18next";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import type { BottomTabBarProps as RouterTabBarProps } from "expo-router/js-tabs";
import type { LucideIcon } from "lucide-react-native";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  Sprout,
  UserRound,
} from "lucide-react-native";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export type BottomTabBarProps = RouterTabBarProps & {
  orderBadge?: number | boolean;
};

const tabDefinitions: {
  key: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  { key: "home", label: "common.home", Icon: Home },
  {
    key: "categories",
    label: "common.categories",
    Icon: LayoutGrid,
  },
  { key: "farm", label: "common.farms", Icon: Sprout },
  {
    key: "orders",
    label: "common.orders",
    Icon: ClipboardList,
  },
  {
    key: "profile",
    label: "common.account",
    Icon: UserRound,
  },
];

const TAB_INDICATOR_WIDTH = 24;
const INDICATOR_TIMING = {
  duration: 150,
  easing: Easing.out(Easing.cubic),
  reduceMotion: ReduceMotion.System,
} as const;

function RouteBadge({ badge }: { badge?: number | boolean }) {
  if (!badge) return null;

  if (typeof badge === "boolean") {
    return (
      <View className="absolute right-1 top-1 h-2 w-2 rounded-full border border-surface bg-secondary dark:bg-primary" />
    );
  }

  return (
    <View className="absolute -right-1 -top-1 min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
      <Text className="font-vietnam text-label-sm font-bold text-on-primary">
        {badge > 99 ? "99+" : badge}
      </Text>
    </View>
  );
}

export function BottomTabBar({
  state,
  emitter,
  navigateToTab,
  orderBadge = false,
}: BottomTabBarProps) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const activeKey = state.routes[state.index]?.name;
  const activeIndex = Math.max(
    0,
    tabDefinitions.findIndex((tab) => tab.key === activeKey),
  );
  const rowWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => {
    const itemWidth = rowWidth.value / tabDefinitions.length;
    const translateX =
      itemWidth * (activeIndex + 0.5) - TAB_INDICATOR_WIDTH / 2;

    return {
      opacity: rowWidth.value > 0 ? 1 : 0,
      transform: [{ translateX: withTiming(translateX, INDICATOR_TIMING) }],
    };
  }, [activeIndex]);

  return (
    <SafeAreaView
      className={cn(
        "overflow-hidden border-border-strong bg-surface",
        width >= 640
          ? "mb-2 w-full max-w-[600px] self-center rounded-xl border"
          : "rounded-t-xl border-x border-t",
      )}
      edges={["bottom"]}
    >
      <View
        className="flex-row"
        onLayout={({ nativeEvent }) => {
          rowWidth.value = nativeEvent.layout.width;
        }}
      >
        <View className="absolute left-0 top-0" pointerEvents="none">
          <Animated.View style={indicatorStyle}>
            <View
              className="h-[4px] rounded-b-full bg-primary"
              style={{ width: TAB_INDICATOR_WIDTH }}
            />
          </Animated.View>
        </View>

        {tabDefinitions.map(({ key, label, Icon }) => {
          const route = state.routes.find(({ name }) => name === key);
          if (!route) return null;

          const active = activeKey === key;
          const iconColor = active ? colors.primary : colors.muted;
          const iconFill = key === "home" && active ? colors.primary : "none";
          const badge = key === "orders" ? orderBadge : undefined;

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={t(label)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className="min-h-[56px] flex-1 items-center gap-1 px-0.5 pb-2 pt-3 active:opacity-70"
              onPress={() => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!active && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
            >
              <View className="relative h-[24px] w-9 items-center justify-center">
                <Icon
                  color={iconColor}
                  fill={iconFill}
                  size={22}
                  strokeWidth={active ? 2.3 : 1.8}
                />
                <RouteBadge badge={badge} />
              </View>
              <Text
                className={`text-center font-vietnam text-label-sm ${active ? "text-primary" : "text-muted"}`}
              >
                {t(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
