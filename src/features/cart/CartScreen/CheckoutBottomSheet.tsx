import { PrimaryBtn } from "@/components/common";
import { getCartTotals, useCartStore, type CartLine, type DeliveryAddress } from "@/features/cart/cart.store";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View, type ScrollViewProps } from "react-native";
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
  const totals = getCartTotals(lines, appliedVouchers);

  function handlePlaceOrder() {
    if (!address) {
      onEditAddress();
      return;
    }

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
                </View>
              }
            />
          ) : null}
        </View>
        <CartSheetFooter>
          <PrimaryBtn
            title="Đặt hàng"
            fullWidth
            disabled={lines.length === 0}
            onPress={handlePlaceOrder}
          />
        </CartSheetFooter>
      </CartBottomSheet>
      {voucherPickerOpen ? <VoucherPickerSheet onClose={() => setVoucherPickerOpen(false)} /> : null}
    </>
  );
}
