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
import { selectUnreadNotificationCount, useNotificationStore } from "@/features/notifications/notifications.store";
import { router } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function renderBottomTabBar(props: BottomTabBarProps) {
  return <BottomTabBar {...props} />;
}

export default function MainLayout() {
  const cartItemsCount = useCartStore(selectCartQuantity);
  const address = useCartStore(selectDeliveryAddress);
  const unreadNotificationsCount = useNotificationStore(selectUnreadNotificationCount);

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="bg-surface" edges={["top"]}>
        <MainHeader
          cartItemsCount={cartItemsCount}
          currentAddress={
            address ? formatDeliveryAddress(address) : "Chưa có địa chỉ"
          }
          onAddressClick={() =>
            router.push({ pathname: "/cart", params: { address: "edit" } })
          }
          onCartClick={() => router.push("/cart")}
          unreadNotificationsCount={unreadNotificationsCount}
          onNotificationClick={() => router.push("/notifications")}
          onProfileClick={() => router.navigate("/(tabs)/profile")}
        />
      </SafeAreaView>
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
  );
}
