import { MemberRoute } from "@/features/auth/components/MemberPrompt";
import { AddressBookBottomSheet } from "@/features/cart/CartScreen/AddressBookBottomSheet";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function AddressBookRoute() {
  const { t } = useTranslation();
  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile");
  }

  return (
    <MemberRoute title={t("cart.deliveryAddressBook")}>
      <View className="flex-1">
        <AddressBookBottomSheet onClose={close} />
      </View>
    </MemberRoute>
  );
}
