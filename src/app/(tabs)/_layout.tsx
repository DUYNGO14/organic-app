import { BottomTabBar, MainHeader } from "@/components/layout";
import {
  formatDeliveryAddress,
  selectCartQuantity,
  selectDeliveryAddress,
  useCartStore,
} from "@/features/cart/cart.store";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainLayout() {
  const cartItemsCount = useCartStore(selectCartQuantity);
  const address = useCartStore(selectDeliveryAddress);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <MainHeader
        cartItemsCount={cartItemsCount}
        currentAddress={
          address ? formatDeliveryAddress(address) : "Chưa có địa chỉ"
        }
        onAddressClick={() =>
          router.push({ pathname: "/cart", params: { address: "edit" } })
        }
        onCartClick={() => router.push("/cart")}
        onProfileClick={() => router.navigate("/(tabs)/profile")}
      />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomTabBar />
    </SafeAreaView>
  );
}
