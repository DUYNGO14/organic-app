import { MemberRoute } from "@/features/auth/components/MemberPrompt";
import CartScreen from "@/features/cart/CartScreen";
import { useTranslation } from "react-i18next";

export default function CartRoute() {
  const { t } = useTranslation();
  return <MemberRoute title={t("common.cart")}><CartScreen /></MemberRoute>;
}
