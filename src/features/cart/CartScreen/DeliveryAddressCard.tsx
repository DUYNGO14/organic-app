import { useTranslation } from "react-i18next";
import { PrimaryBtn } from "@/components/common";
import { formatDeliveryAddress, type DeliveryAddress } from "@/features/cart/cart.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { ArrowRight, MapPin, MapPinOff } from "lucide-react-native";
import { Text, View } from "react-native";

export function DeliveryAddressCard({
  address,
  onEdit,
}: {
  address: DeliveryAddress | null;
  onEdit?: () => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  if (!address) {
    return (
      <View className="flex-row items-start gap-3 rounded-lg bg-danger-container/30 p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-danger-container">
          <MapPinOff color={colors.danger} size={20} />
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Text className="font-vietnam text-body-emphasis text-danger">{t("cart.noDeliveryAddressesYet")}</Text>
          <Text className="font-vietnam text-body-sm text-ink">
            {t("cart.addAnAddressSoWeCan")}</Text>
          <PrimaryBtn
            title={t("cart.addAnAddress")}
            trailingIcon={<ArrowRight color={colors.onPrimary} size={16} />}
            className="mt-1"
            onPress={onEdit}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="gap-1 rounded-lg border border-card-border bg-surface px-4 pb-4 pt-2">
      <View className="min-h-12 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <MapPin color={colors.primary} size={18} />
          <Text className="flex-1 font-vietnam text-body-emphasis text-ink">{t("cart.deliveryAddress")}</Text>
        </View>
        {onEdit ? (
          <PrimaryBtn title={t("cart.change")} variant="ghost" onPress={onEdit} />
        ) : null}
      </View>
      <Text className="font-vietnam text-body-emphasis text-ink">
        {address.name} · +84 {address.phone}
      </Text>
      <Text className="font-vietnam text-body-md text-muted">{formatDeliveryAddress(address)}</Text>
    </View>
  );
}
