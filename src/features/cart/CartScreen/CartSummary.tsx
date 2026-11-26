import { WELCOME_VOUCHER, getCartTotals } from "@/features/cart/cart.store";
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { Percent, Ticket } from "lucide-react-native";
import { Text, View } from "react-native";

type Totals = ReturnType<typeof getCartTotals>;

export function CartOffer({ totals }: { totals: Totals }) {
  const colors = useAppColors();
  const discount = totals.productVoucherCode === WELCOME_VOUCHER.code ? totals.productDiscount : 0;

  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <Ticket color={colors.primary} size={20} />
        <Text className="font-vietnam text-body-emphasis text-ink">Ưu đãi khách mới</Text>
      </View>
      <View className="flex-row items-center gap-2 rounded bg-surface-container p-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Percent color={colors.onPrimary} size={16} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-label-lg text-primary">{WELCOME_VOUCHER.code}</Text>
          <Text className="font-vietnam text-body-sm text-muted">
            Giảm {WELCOME_VOUCHER.percent}%, tối đa {formatPrice(WELCOME_VOUCHER.maxDiscount)} cho đơn đầu tiên
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
  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <Text className="font-vietnam text-title-md text-ink">Chi tiết thanh toán</Text>
      <SummaryRow label={`Tạm tính (${selectedCount} sản phẩm)`} amount={formatPrice(totals.subtotal)} />
      {totals.productDiscount > 0 ? (
        <SummaryRow label={`Giảm tiền sản phẩm (${totals.productVoucherCode})`} amount={`−${formatPrice(totals.productDiscount)}`} />
      ) : null}
      <SummaryRow label="Phí vận chuyển lạnh dự kiến" amount={formatPrice(totals.shipping)} />
      {totals.shippingDiscount > 0 ? (
        <SummaryRow label={`Giảm phí vận chuyển (${totals.shippingVoucherCode})`} amount={`−${formatPrice(totals.shippingDiscount)}`} />
      ) : null}
      <View className="flex-row items-center justify-between gap-2 border-t border-border pt-3">
        <Text className="flex-1 font-vietnam text-body-emphasis text-ink">Tổng cộng tạm tính</Text>
        <Text className="font-vietnam text-title-md tabular-nums text-primary">{formatPrice(totals.total)}</Text>
      </View>
    </View>
  );
}
