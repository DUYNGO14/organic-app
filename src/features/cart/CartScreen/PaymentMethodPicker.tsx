import { useCartStore, type PaymentMethod } from "@/features/cart/cart.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { Banknote, Landmark } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

const methods = [
  { id: "cash", title: "Tiền mặt khi nhận hàng", Icon: Banknote },
  { id: "bank-transfer", title: "Chuyển khoản ngân hàng", Icon: Landmark },
] satisfies { id: PaymentMethod; title: string; Icon: typeof Banknote }[];

export function PaymentMethodPicker() {
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod);
  const colors = useAppColors();

  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4" accessibilityRole="radiogroup">
      <Text className="font-vietnam text-title-md text-ink">Phương thức thanh toán</Text>
      {methods.map(({ id, title, Icon }) => {
        const selected = paymentMethod === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={cn(
              "min-h-12 flex-row items-center gap-3 rounded border px-3 py-2 active:bg-surface-container",
              selected ? "border-primary bg-primary/10" : "border-border bg-surface-soft",
            )}
            onPress={() => setPaymentMethod(id)}
          >
            <Icon color={selected ? colors.primary : colors.muted} size={22} />
            <Text className="flex-1 font-vietnam text-body-emphasis text-ink">{title}</Text>
            <View className={cn("h-5 w-5 items-center justify-center rounded-full border", selected ? "border-primary" : "border-border-strong")}>
              {selected ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
            </View>
          </Pressable>
        );
      })}
      <Text className="font-vietnam text-body-sm text-muted">
        Bạn có thể chọn trước phương thức. Tính năng đặt hàng và thanh toán chưa khả dụng.
      </Text>
    </View>
  );
}
