import { AddressBookBottomSheet } from "@/features/cart/CartScreen/AddressBookBottomSheet";
import { router } from "expo-router";
import { View } from "react-native";

export default function AddressBookRoute() {
  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile");
  }

  return (
    <View className="flex-1">
      <AddressBookBottomSheet onClose={close} />
    </View>
  );
}
