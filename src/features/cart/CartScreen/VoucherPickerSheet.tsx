import { useTranslation } from "react-i18next";
import { AppSheet, type AppSheetHandle, SheetFooter } from "@/components/common/BottomSheet";
import { PrimaryBtn } from "@/components/common";
import { CART_VOUCHERS, useCartStore, type AppliedVouchers, type VoucherType } from "@/features/cart/cart.store";
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Tag, Truck } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View, type ScrollViewProps } from "react-native";

const snapPoints = ["82%"];
const groups: { type: VoucherType; title: string }[] = [
  { type: "shipping", title: "cart.shippingVoucher" },
  { type: "product", title: "cart.productVoucher" },
];

type VoucherRow =
  | { kind: "heading"; key: string; title: string }
  | { kind: "voucher"; key: string; type: VoucherType; code: string; description: string };

export function VoucherPickerSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const sheetRef = useRef<AppSheetHandle>(null);
  const colors = useAppColors();
  const [draft, setDraft] = useState<AppliedVouchers>(() => useCartStore.getState().appliedVouchers);
  const [viewportHeight, setViewportHeight] = useState(0);
  const setAppliedVouchers = useCartStore((state) => state.setAppliedVouchers);
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();
  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

  const rows = groups.flatMap<VoucherRow>(({ type, title }) => [
    { kind: "heading", key: type, title },
    ...CART_VOUCHERS[type].map((voucher) => ({
      kind: "voucher" as const,
      key: `${type}-${voucher.code}`,
      type,
      code: voucher.code,
      description: "percent" in voucher
        ? t("cart.saveUpTo", { percent: voucher.percent, value2: formatPrice(voucher.maxDiscount) })
        : t("cart.saveUpToOnShipping", { value: formatPrice(voucher.maxDiscount) }),
    })),
  ]);

  return (
    <AppSheet
      header={{
        title: t("cart.chooseAVoucher"),
        actionLabel: t("cart.closeVoucherPicker"),
        subtitle: t("cart.chooseUpToOneVoucherOf"),
      }}
      ref={sheetRef}
      fullWindowOnIOS
      snapPoints={snapPoints}
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
            data={rows}
            extraData={draft}
            keyExtractor={(row) => row.key}
            getItemType={(row) => row.kind}
            renderScrollComponent={renderScrollComponent}
            renderItem={({ item }) => {
              if (item.kind === "heading") {
                return (
                  <Text accessibilityRole="header" className="pb-2 pt-1 font-vietnam text-body-emphasis text-ink">
                    {t(item.title)}
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
      <SheetFooter guardGesture>
        <PrimaryBtn
          title={t("cart.apply")}
          fullWidth
          onPress={() => {
            setAppliedVouchers(draft);
            dismiss();
          }}
        />
      </SheetFooter>
    </AppSheet>
  );
}
