import { useTranslation } from "react-i18next";
import {
  BottomTabBar,
  MainHeader,
  type BottomTabBarProps,
} from "@/components/layout";
import {
  formatDeliveryAddress,
  selectCartQuantity,
  selectDeliveryAddress,
  useCartStore,
} from "@/features/cart/cart.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { requestSignIn } from "@/features/auth/member-access";
import { selectUnreadNotificationCount, useNotificationStore } from "@/features/notifications/notifications.store";
import { router } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function renderBottomTabBar(props: BottomTabBarProps) {
  return <BottomTabBar {...props} />;
}

export default function MainLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const session = useAuthStore((state) => state.session);
  const cartItemsCount = useCartStore(selectCartQuantity);
  const address = useCartStore(selectDeliveryAddress);
  const unreadNotificationsCount = useNotificationStore(selectUnreadNotificationCount);
  const frameStyle = { paddingHorizontal: width >= 640 ? 8 : 0 };

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="bg-surface" edges={["top", "left", "right"]}>
        <View className="w-full max-w-[1000px] self-center" style={frameStyle}>
          <MainHeader
            userName={session ? session.userData?.name?.trim() || t("account.adigoMember") : undefined}
            cartItemsCount={session ? cartItemsCount : 0}
            currentAddress={
              session && address ? formatDeliveryAddress(address) : t("common.noDeliveryAddress")
            }
            onAddressClick={() => requestSignIn(() => router.navigate("/address-book"))}
            onCartClick={() => requestSignIn(() => router.push("/cart"))}
            unreadNotificationsCount={session ? unreadNotificationsCount : 0}
            onNotificationClick={() => requestSignIn(() => router.push("/notifications"))}
            onProfileClick={() => router.navigate("/(tabs)/profile")}
          />
        </View>
      </SafeAreaView>
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
        <View className="w-full max-w-[1000px] flex-1 self-center" style={frameStyle}>
          <Tabs
            backBehavior="history"
            screenOptions={{ headerShown: false, animation: "none" }}
            tabBar={renderBottomTabBar}
          >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="categories" />
            <Tabs.Screen name="farm" />
            <Tabs.Screen name="orders" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
      </SafeAreaView>
    </View>
  );
}
