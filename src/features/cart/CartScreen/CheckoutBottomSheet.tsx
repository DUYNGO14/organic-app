import { Checkbox, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { acceptLegalDocuments, getLegalAccount } from "@/features/legal/legal.service";
import { getCartTotals, selectDeliveryAddress, useCartStore, type CartLine } from "@/features/cart/cart.store";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { Pressable, Text, View, type ScrollViewProps } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { AddressBookBottomSheet } from "./AddressBookBottomSheet";
import { AppSheet, SheetFooter } from "@/components/common/BottomSheet";
import { CartItemCard } from "./CartItemCard";
import { CartSummary } from "./CartSummary";
import { DeliveryAddressCard } from "./DeliveryAddressCard";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { VoucherPickerSheet } from "./VoucherPickerSheet";
import { VoucherSection } from "./VoucherSection";

type CheckoutBottomSheetProps = {
  lines: CartLine[];
  onClose: () => void;
  onQuantityChange?: (id: string, quantity: number) => void;
};

export function CheckoutBottomSheet({
  lines,
  onClose,
  onQuantityChange,
}: CheckoutBottomSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [voucherPickerOpen, setVoucherPickerOpen] = useState(false);
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();
  const address = useCartStore(selectDeliveryAddress);
  const appliedVouchers = useCartStore((state) => state.appliedVouchers);
  const account = useAuthStore((state) => getLegalAccount(state.session));
  const totals = getCartTotals(lines, appliedVouchers);
  const [hasAcceptedCheckoutTerms, setHasAcceptedCheckoutTerms] = useState(false);

  async function handlePlaceOrder() {
    if (!address) {
      setAddressBookOpen(true);
      return;
    }

    if (!hasAcceptedCheckoutTerms) {
      Toast.show({ type: "info", text1: "Cần xác nhận điều khoản", text2: "Vui lòng đọc và đồng ý điều khoản mua bán trước khi đặt hàng." });
      return;
    }

    if (account) await acceptLegalDocuments(account, ["sale", "delivery", "returns"], "checkout");

    Toast.show({
      type: "error",
      text1: "Chưa thể đặt hàng",
      text2: "Ứng dụng chưa kết nối hệ thống đặt hàng.",
    });
  }

  if (addressBookOpen) {
    return <AddressBookBottomSheet onClose={() => setAddressBookOpen(false)} />;
  }

  return (
    <>
      <AppSheet
        mode="inline"
        header={{ title: "Xem lại thanh toán" }}
        enableContentPanningGesture={false}
        onDismiss={onClose}
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
              renderItem={({ item }) => (
                <View className="pb-3">
                  <CartItemCard
                    line={item}
                    variant="checkout"
                    onQuantityChange={
                      onQuantityChange
                        ? (quantity) => onQuantityChange(item.id, quantity)
                        : undefined
                    }
                  />
                </View>
              )}
              renderScrollComponent={renderScrollComponent}
              ListHeaderComponent={
                <View className="pb-4">
                  <DeliveryAddressCard
                    address={address}
                    onEdit={() => setAddressBookOpen(true)}
                  />
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
        <SheetFooter guardGesture>
          <PrimaryBtn
            title="Đặt hàng"
            fullWidth
            disabled={lines.length === 0 || !hasAcceptedCheckoutTerms}
            onPress={() => void handlePlaceOrder()}
          />
        </SheetFooter>
      </AppSheet>
      {voucherPickerOpen ? <VoucherPickerSheet onClose={() => setVoucherPickerOpen(false)} /> : null}
    </>
  );
}
