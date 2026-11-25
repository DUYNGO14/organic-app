import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { Checkbox, PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import {
  getCartTotals,
  selectDeliveryAddress,
  useCartStore,
  type CartLine,
} from "@/features/cart/cart.store";
import { formatPrice } from "@/features/products/ProductDetailScreen/components/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { ShoppingBag, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddressBookBottomSheet } from "./AddressBookBottomSheet";
import { CartItemCard } from "./CartItemCard";
import { CartOffer, CartSummary } from "./CartSummary";
import { CheckoutBottomSheet } from "./CheckoutBottomSheet";
import { DeliveryAddressCard } from "./DeliveryAddressCard";
import { EmptyCart } from "./EmptyCart";

function renderCartLine({ item }: { item: CartLine }) {
  return <CartItemCard line={item} />;
}

function LineSeparator() {
  return <View className="h-3" />;
}

export default function CartScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const { address: addressAction } = useLocalSearchParams<{
    address?: string;
  }>();
  const colors = useAppColors();
  const lines = useCartStore((state) => state.lines);
  const appliedVouchers = useCartStore((state) => state.appliedVouchers);
  const address = useCartStore(selectDeliveryAddress);
  const setAllSelected = useCartStore((state) => state.setAllSelected);
  const removeSelected = useCartStore((state) => state.removeSelected);
  const [addressBookOpen, setAddressBookOpen] = useState(
    addressAction === "edit",
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const selectedLines = lines.filter((line) => line.selected);
  const selectedCount = selectedLines.length;
  const hasSelection = selectedCount > 0;
  const allSelected = hasSelection && selectedCount === lines.length;
  const totals = getCartTotals(selectedLines, appliedVouchers);

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-surface"
        accessibilityElementsHidden={checkoutOpen || addressBookOpen}
        importantForAccessibility={
          checkoutOpen || addressBookOpen ? "no-hide-descendants" : "auto"
        }
      >
        <StackHeader
          title="Giỏ hàng của bạn"
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/home");
          }}
          // rightAction={
          //   <IconButton
          //     icon={<UserRound color={colors.onPrimary} size={20} />}
          //     label="Tài khoản"
          //     variant="filled"
          //     size="lg"
          //     onPress={() => router.navigate("/(tabs)/profile")}
          //   />
          // }
        />
        <View className="flex-1 bg-surface-soft">
          {isLoading ? (
            <ScreenSkeleton variant="cart" />
          ) : lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <FlashList
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 24,
                }}
                data={lines}
                keyExtractor={(line) => line.id}
                renderItem={renderCartLine}
                ItemSeparatorComponent={LineSeparator}
                ListHeaderComponent={
                  <View className="gap-3 pb-2 pt-2">
                    <View className="flex-row flex-wrap items-center justify-between gap-x-2">
                      <View className="min-h-12 flex-1 flex-row items-center gap-2">
                        <ShoppingBag color={colors.primary} size={22} />
                        <Text className="flex-1 font-vietnam text-body-emphasis text-ink">
                          {lines.length} sản phẩm trong giỏ
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !hasSelection }}
                        className={`min-h-12 flex-row items-center gap-1 rounded-full bg-danger-container/40 px-3 ${hasSelection ? "active:opacity-80" : "opacity-50"}`}
                        disabled={!hasSelection}
                        onPress={removeSelected}
                      >
                        <Trash2 color={colors.danger} size={16} />
                        <Text className="font-vietnam text-label-md text-danger">
                          Xóa đã chọn
                        </Text>
                      </Pressable>
                    </View>
                    <DeliveryAddressCard
                      address={address}
                      onEdit={() => setAddressBookOpen(true)}
                    />
                    <Checkbox
                      checked={allSelected}
                      indeterminate={hasSelection && !allSelected}
                      label={`Chọn tất cả (${lines.length} sản phẩm)`}
                      onCheckedChange={setAllSelected}
                    />
                  </View>
                }
                ListFooterComponent={
                  <View className="gap-4 pt-4">
                    <CartOffer totals={totals} />
                    <CartSummary
                      selectedCount={selectedCount}
                      totals={totals}
                    />
                  </View>
                }
              />
              <View className="flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3">
                <View className="min-w-32 flex-1 gap-1">
                  <Text className="font-vietnam text-label-md text-muted">
                    Tổng thanh toán
                  </Text>
                  <Text
                    accessibilityLiveRegion="polite"
                    className="font-vietnam text-title-md tabular-nums text-primary"
                  >
                    {formatPrice(totals.total)}
                  </Text>
                  {totals.discount > 0 ? (
                    <Text className="font-vietnam text-label-sm tabular-nums text-primary">
                      Tiết kiệm {formatPrice(totals.discount)}
                    </Text>
                  ) : null}
                </View>
                <PrimaryBtn
                  title={`Thanh Toán (${selectedCount})`}
                  // trailingIcon={
                  //   <LockKeyhole color={colors.onPrimary} size={17} />
                  // }
                  disabled={!hasSelection}
                  onPress={() => setCheckoutOpen(true)}
                />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
      {addressBookOpen ? (
        <AddressBookBottomSheet onClose={() => setAddressBookOpen(false)} />
      ) : checkoutOpen ? (
        <CheckoutBottomSheet
          lines={selectedLines}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}
    </>
  );
}
