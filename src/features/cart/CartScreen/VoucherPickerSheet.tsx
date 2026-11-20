import { IconButton, PrimaryBtn } from "@/components/common";
import { CART_VOUCHERS, useCartStore, type AppliedVouchers, type VoucherType } from "@/features/cart/cart.store";
import { formatPrice } from "@/features/products/ProductDetailScreen/components/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { BottomSheetModal, useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Tag, Truck, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { BackHandler, Platform, Pressable, Text, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import { CartSheetFooter, SheetBackdrop, SheetBackground } from "./CartBottomSheet";

const snapPoints = ["82%"];
const groups: { type: VoucherType; title: string }[] = [
  { type: "shipping", title: "Mã phí vận chuyển" },
  { type: "product", title: "Mã sản phẩm" },
];

type VoucherRow =
  | { kind: "heading"; key: string; title: string }
  | { kind: "voucher"; key: string; type: VoucherType; code: string; description: string };

const rows = groups.flatMap<VoucherRow>(({ type, title }) => [
  { kind: "heading", key: type, title },
  ...CART_VOUCHERS[type].map((voucher) => ({
    kind: "voucher" as const,
    key: `${type}-${voucher.code}`,
    type,
    code: voucher.code,
    description: "percent" in voucher
      ? `Giảm ${voucher.percent}%, tối đa ${formatPrice(voucher.maxDiscount)}`
      : `Giảm phí vận chuyển tối đa ${formatPrice(voucher.maxDiscount)}`,
  })),
]);

function PickerContainer({ children }: PropsWithChildren) {
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}

export function VoucherPickerSheet({ onClose }: { onClose: () => void }) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const colors = useAppColors();
  const { top } = useSafeAreaInsets();
  const [draft, setDraft] = useState<AppliedVouchers>(() => useCartStore.getState().appliedVouchers);
  const [viewportHeight, setViewportHeight] = useState(0);
  const setAppliedVouchers = useCartStore((state) => state.setAppliedVouchers);
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();
  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

  useEffect(() => {
    sheetRef.current?.present();
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      containerComponent={Platform.OS === "ios" ? PickerContainer : undefined}
      snapPoints={snapPoints}
      topInset={top}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      enablePanDownToClose
      backdropComponent={SheetBackdrop}
      backgroundComponent={SheetBackground}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      onDismiss={onClose}
    >
      <View className="flex-1" accessibilityViewIsModal onAccessibilityEscape={dismiss}>
        <View className="flex-row items-center gap-2 border-b border-border px-4 pb-2">
          <View className="min-w-0 flex-1 gap-1">
            <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">Chọn voucher</Text>
            <Text className="font-vietnam text-body-sm text-muted">Chọn tối đa một mã mỗi loại. Chạm lại để bỏ chọn.</Text>
          </View>
          <IconButton label="Đóng bộ chọn voucher" size="lg" icon={<X color={colors.ink} size={22} />} onPress={dismiss} />
        </View>
        <View
          style={{ flex: 1, minHeight: 0 }}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        >
          {viewportHeight > 0 ? (
            <FlashList
              style={{ flex: 0, height: viewportHeight }}
              contentContainerStyle={{ padding: 16 }}
              data={rows}
              extraData={draft}
              keyExtractor={(row) => row.key}
              getItemType={(row) => row.kind}
              renderScrollComponent={renderScrollComponent}
              renderItem={({ item }) => {
                if (item.kind === "heading") {
                  return (
                    <Text accessibilityRole="header" className="pb-2 pt-1 font-vietnam text-body-emphasis text-ink">
                      {item.title}
                    </Text>
                  );
                }

                const { type, code, description } = item;
                const selected = draft[type] === code;
                const Icon = type === "shipping" ? Truck : Tag;

                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${code}. ${description}`}
                    onPress={() => setDraft((previous) => ({
                      ...previous,
                      [type]: previous[type] === code ? null : code,
                    }))}
                    className={cn(
                      "mb-3 min-h-12 flex-row items-center gap-3 rounded-lg border p-3 active:bg-surface-container",
                      selected ? "border-primary bg-primary/10" : "border-card-border bg-surface-soft",
                    )}
                  >
                    <Icon color={colors.primary} size={20} />
                    <View className="min-w-0 flex-1">
                      <Text className="font-vietnam text-label-lg text-primary">{code}</Text>
                      <Text className="font-vietnam text-body-sm text-muted">{description}</Text>
                    </View>
                    <View className={cn(
                      "h-5 w-5 items-center justify-center rounded-full border",
                      selected ? "border-primary" : "border-border-strong",
                    )}>
                      {selected ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          ) : null}
        </View>
        <CartSheetFooter>
          <PrimaryBtn
            title="Áp dụng"
            fullWidth
            onPress={() => {
              setAppliedVouchers(draft);
              dismiss();
            }}
          />
        </CartSheetFooter>
      </View>
    </BottomSheetModal>
  );
}
