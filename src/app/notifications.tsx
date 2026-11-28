import { MemberRoute } from "@/features/auth/components/MemberPrompt";
import NotificationsScreen from "@/features/notifications/NotificationsScreen";
import { useTranslation } from "react-i18next";

export default function NotificationsRoute() {
  const { t } = useTranslation();
  return <MemberRoute title={t("common.notifications")}><NotificationsScreen /></MemberRoute>;
}
