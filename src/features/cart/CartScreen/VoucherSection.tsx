import type { AppliedVouchers } from "@/features/cart/cart.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { ChevronRight, Ticket } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function VoucherSection({ vouchers, onPress }: {
  vouchers: AppliedVouchers;
  onPress: () => void;
}) {
  const colors = useAppColors();
  const codes = [vouchers.shipping, vouchers.product].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={codes ? `Chọn voucher. Đang áp dụng ${codes}` : "Chọn voucher"}
      onPress={onPress}
      className="min-h-12 flex-row items-center gap-3 rounded-lg border border-card-border bg-surface p-4 active:bg-surface-soft"
    >
      <Ticket color={colors.primary} size={22} />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-vietnam text-title-md text-ink">Voucher</Text>
        <Text className="font-vietnam text-body-sm text-muted">
          {codes || "Chọn mã vận chuyển và mã sản phẩm"}
        </Text>
      </View>
      <ChevronRight color={colors.muted} size={20} />
    </Pressable>
  );
}
