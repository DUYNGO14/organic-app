import { useTranslation } from "react-i18next";
import { WELCOME_VOUCHER, getCartTotals } from "@/features/cart/cart.store";
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { Percent, Ticket } from "lucide-react-native";
import { Text, View } from "react-native";

type Totals = ReturnType<typeof getCartTotals>;

export function CartOffer({ totals }: { totals: Totals }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const discount = totals.productVoucherCode === WELCOME_VOUCHER.code ? totals.productDiscount : 0;

  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Ticket color={colors.primary} size={20} />
        <Text className="font-vietnam text-body-emphasis text-ink">{t("cart.newCustomerOffer")}</Text>
      </View>
      <View className="flex-row items-center gap-2 rounded bg-surface-container p-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Percent color={colors.onPrimary} size={16} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-label-lg text-primary">{WELCOME_VOUCHER.code}</Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {t("cart.saveUpToOnYourFirst", { percent: WELCOME_VOUCHER.percent, value2: formatPrice(WELCOME_VOUCHER.maxDiscount) })}
          </Text>
        </View>
        {discount > 0 ? (
          <Text className="font-vietnam text-label-lg tabular-nums text-primary">
            −{formatPrice(discount)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function SummaryRow({ label, amount }: { label: string; amount: string }) {
  return (
    <View className="flex-row justify-between gap-2">
      <Text className="min-w-0 flex-1 font-vietnam text-body-md text-muted">{label}</Text>
      <Text className="font-vietnam text-body-emphasis tabular-nums text-ink">{amount}</Text>
    </View>
  );
}

export function CartSummary({
  selectedCount,
  totals,
}: {
  selectedCount: number;
  totals: Totals;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <Text className="font-vietnam text-title-md text-ink">{t("cart.paymentDetails")}</Text>
      <SummaryRow label={t("cart.subtotalItems", { count: selectedCount })} amount={formatPrice(totals.subtotal)} />
      {totals.productDiscount > 0 ? (
        <SummaryRow label={t("cart.productDiscount", { productVoucherCode: totals.productVoucherCode })} amount={`−${formatPrice(totals.productDiscount)}`} />
      ) : null}
      <SummaryRow label={t("cart.estimatedChilledDeliveryFee")} amount={formatPrice(totals.shipping)} />
      {totals.shippingDiscount > 0 ? (
        <SummaryRow label={t("cart.shippingDiscount", { shippingVoucherCode: totals.shippingVoucherCode })} amount={`−${formatPrice(totals.shippingDiscount)}`} />
      ) : null}
      <View className="flex-row items-center justify-between gap-2 border-t border-border pt-3">
        <Text className="flex-1 font-vietnam text-body-emphasis text-ink">{t("cart.estimatedTotal")}</Text>
        <Text className="font-vietnam text-title-md tabular-nums text-primary">{formatPrice(totals.total)}</Text>
      </View>
    </View>
  );
}
