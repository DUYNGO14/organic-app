import { useTranslation } from "react-i18next";
import { useIsFocused } from "expo-router";
import { View } from "react-native";
import { SkeletonBlock, SkeletonGroup } from "./index";

export type ScreenLoadingProps = { isLoading?: boolean };

function ProductCards() {
  return (
    <View className="flex-row gap-3">
      {[0, 1].map((index) => (
        <View key={index} className="flex-1 gap-3 rounded-lg border border-card-border bg-surface p-3">
          <SkeletonBlock className="aspect-square w-full" />
          <SkeletonBlock className="h-3 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </View>
      ))}
    </View>
  );
}

function Rows({ count, icon = false }: { count: number; icon?: boolean }) {
  return Array.from({ length: count }, (_, index) => (
    <View key={index} className="flex-row items-center gap-3 rounded-lg border border-card-border bg-surface p-4">
      {icon ? <SkeletonBlock className="h-12 w-12 rounded-full" /> : null}
      <View className="flex-1 gap-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </View>
    </View>
  ));
}

const layouts = {
  home: {
    label: "common.loadingHome",
    content: () => (
      <>
        <SkeletonBlock className="h-12 w-full rounded-full" />
        <SkeletonBlock className="h-48 w-full rounded-xl" />
        <SkeletonBlock className="h-5 w-1/2" />
        <View className="flex-row gap-2">
          <SkeletonBlock className="h-12 flex-1 rounded-full" />
          <SkeletonBlock className="h-12 flex-1 rounded-full" />
          <SkeletonBlock className="h-12 flex-1 rounded-full" />
        </View>
        <ProductCards />
      </>
    ),
  },
  catalog: {
    label: "common.loadingProductCategories",
    content: () => (
      <>
        <SkeletonBlock className="h-12 w-full rounded-full" />
        <SkeletonBlock className="h-28 w-full rounded-lg" />
        <SkeletonBlock className="h-10 w-2/3" />
        <ProductCards />
        <ProductCards />
      </>
    ),
  },
  product: {
    label: "common.loadingProductDetails",
    content: () => (
      <>
        <SkeletonBlock className="aspect-square w-full rounded-lg" />
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="h-5 w-1/3" />
        <Rows count={2} />
      </>
    ),
  },
  cart: {
    label: "common.loadingCart",
    content: () => (
      <>
        <SkeletonBlock className="h-20 w-full rounded-lg" />
        <Rows count={3} icon />
      </>
    ),
  },
  orders: {
    label: "common.loadingOrders",
    content: () => (
      <>
        <SkeletonBlock className="h-6 w-1/2" />
        <SkeletonBlock className="h-12 w-2/3 rounded-full" />
        <Rows count={4} icon />
      </>
    ),
  },
  farm: {
    label: "common.loadingFarmInformation",
    content: () => (
      <>
        <SkeletonBlock className="h-48 w-full rounded-xl" />
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="h-36 w-full rounded-lg" />
        <Rows count={2} icon />
      </>
    ),
  },
  profile: {
    label: "common.loadingAccountInformation",
    content: () => (
      <>
        <Rows count={1} icon />
        <SkeletonBlock className="h-28 w-full rounded-lg" />
        <Rows count={3} icon />
      </>
    ),
  },
  notifications: {
    label: "common.loadingNotifications",
    content: () => (
      <>
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="h-12 w-2/3 rounded-full" />
        <Rows count={4} icon />
      </>
    ),
  },
};

export function ScreenSkeleton({ variant }: { variant: keyof typeof layouts }) {
  const { t } = useTranslation();
  const focused = useIsFocused();
  const { label, content: Content } = layouts[variant];
  return (
    <SkeletonGroup
      active={focused}
      className="flex-1 overflow-hidden bg-surface-soft px-4 py-4"
      label={t(label)}
    >
      <View className="gap-4">
        <Content />
      </View>
    </SkeletonGroup>
  );
}
