import { useAuthStore } from "@/features/auth/auth.store";
import { MemberPrompt } from "@/features/auth/components/MemberPrompt";
import OrdersScreen from "@/features/orders/OrdersScreen";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

export default function OrdersRoute() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);

  return session ? <OrdersScreen /> : (
    <ScrollView className="flex-1 bg-canvas" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}>
      <MemberPrompt title={t("orders.yourOrders")} description={t("orders.signInToSeeOrders")} />
    </ScrollView>
  );
}
