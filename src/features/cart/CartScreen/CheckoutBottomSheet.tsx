import { Checkbox, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { acceptLegalDocuments } from "@/features/legal/legal.service";
import { getCartTotals, useCartStore, type CartLine, type DeliveryAddress } from "@/features/cart/cart.store";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { Pressable, Text, View, type ScrollViewProps } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { CartBottomSheet, CartSheetFooter } from "./CartBottomSheet";
import { CartItemCard } from "./CartItemCard";
import { CartSummary } from "./CartSummary";
import { DeliveryAddressCard } from "./DeliveryAddressCard";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { VoucherPickerSheet } from "./VoucherPickerSheet";
import { VoucherSection } from "./VoucherSection";

function renderCheckoutItem({ item }: { item: CartLine }) {
  return (
    <View className="pb-3">
      <CartItemCard line={item} variant="checkout" />
    </View>
  );
}

type CheckoutBottomSheetProps = {
  address: DeliveryAddress | null;
  lines: CartLine[];
  onEditAddress: () => void;
  onClose: () => void;
};

export function CheckoutBottomSheet({
  address,
  lines,
  onEditAddress,
  onClose,
}: CheckoutBottomSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [voucherPickerOpen, setVoucherPickerOpen] = useState(false);
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();
  const appliedVouchers = useCartStore((state) => state.appliedVouchers);
  const phone = useAuthStore((state) => state.session?.phone);
  const totals = getCartTotals(lines, appliedVouchers);
  const [hasAcceptedCheckoutTerms, setHasAcceptedCheckoutTerms] = useState(false);

  async function handlePlaceOrder() {
    if (!address) {
      onEditAddress();
      return;
    }

    if (!hasAcceptedCheckoutTerms) {
      Toast.show({ type: "info", text1: "Cần xác nhận điều khoản", text2: "Vui lòng đọc và đồng ý điều khoản mua bán trước khi đặt hàng." });
      return;
    }

    if (phone) await acceptLegalDocuments(phone, ["sale", "delivery", "returns"], "checkout");

    Toast.show({
      type: "error",
      text1: "Chưa thể đặt hàng",
      text2: "Ứng dụng chưa kết nối hệ thống đặt hàng.",
    });
  }

  return (
    <>
      <CartBottomSheet
        title="Xem lại thanh toán"
        enableContentPanningGesture={false}
        onClose={onClose}
      >
        <View
          style={{ flex: 1, minHeight: 0 }}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        >
          {viewportHeight > 0 ? (
            <FlashList
              style={{ flex: 0, height: viewportHeight }}
              contentContainerStyle={{ padding: 16 }}
              data={lines}
              keyExtractor={(line) => line.id}
              renderItem={renderCheckoutItem}
              renderScrollComponent={renderScrollComponent}
              ListHeaderComponent={
                <View className="pb-4">
                  <DeliveryAddressCard address={address} onEdit={onEditAddress} />
                </View>
              }
              ListFooterComponent={
                <View className="gap-4 pt-1">
                  <VoucherSection vouchers={appliedVouchers} onPress={() => setVoucherPickerOpen(true)} />
                  <PaymentMethodPicker />
                  <CartSummary selectedCount={lines.length} totals={totals} />
                  <View className="rounded-lg border border-card-border bg-surface-container-low/60 p-3">
                    <Checkbox
                      checked={hasAcceptedCheckoutTerms}
                      description="Tôi đã đọc và đồng ý với điều khoản giao dịch áp dụng cho đơn hàng này."
                      label="Xác nhận điều khoản đặt hàng"
                      onCheckedChange={setHasAcceptedCheckoutTerms}
                    />
                    <View className="ml-8 mt-1 flex-row flex-wrap gap-x-3">
                      <Pressable accessibilityRole="link" onPress={() => router.push("/legal/sale")}><Text className="font-vietnam text-body-sm text-primary">Mua bán</Text></Pressable>
                      <Pressable accessibilityRole="link" onPress={() => router.push("/legal/delivery")}><Text className="font-vietnam text-body-sm text-primary">Giao hàng</Text></Pressable>
                      <Pressable accessibilityRole="link" onPress={() => router.push("/legal/returns")}><Text className="font-vietnam text-body-sm text-primary">Đổi trả</Text></Pressable>
                    </View>
                  </View>
                </View>
              }
            />
          ) : null}
        </View>
        <CartSheetFooter>
          <PrimaryBtn
            title="Đặt hàng"
            fullWidth
            disabled={lines.length === 0 || !hasAcceptedCheckoutTerms}
            onPress={() => void handlePlaceOrder()}
          />
        </CartSheetFooter>
      </CartBottomSheet>
      {voucherPickerOpen ? <VoucherPickerSheet onClose={() => setVoucherPickerOpen(false)} /> : null}
    </>
  );
}
