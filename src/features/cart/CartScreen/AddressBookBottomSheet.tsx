import { PrimaryBtn } from "@/components/common";
import {
  formatDeliveryAddress,
  selectDeliveryAddress,
  useCartStore,
  type DeliveryAddress,
  type SavedDeliveryAddress,
} from "@/features/cart/cart.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import {
  Building2,
  Check,
  CheckCircle2,
  House,
  MapPin,
  MapPinPlus,
  Plus,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { CartBottomSheet, CartSheetFooter } from "./CartBottomSheet";
import { DeliveryAddressForm } from "./DeliveryAddressForm";

type AddressEntryProps = {
  address: SavedDeliveryAddress;
  selected: boolean;
  isDefault: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
};

function AddressEntry({
  address,
  selected,
  isDefault,
  onSelect,
  onEdit,
  onSetDefault,
  onDelete,
}: AddressEntryProps) {
  const colors = useAppColors();
  const LabelIcon = address.label === "office" ? Building2 : House;

  return (
    <View
      className={cn(
        "mb-3 rounded-lg border bg-surface px-3 pb-2",
        selected ? "border-primary" : "border-card-border",
      )}
    >
      <NativeViewGestureHandler disallowInterruption>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: selected }}
          className="min-h-12 gap-2 py-3"
          onPress={onSelect}
        >
          <View className="flex-row items-start gap-2">
            <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
              <Text className="font-vietnam text-body-emphasis text-ink">
                {address.name}
              </Text>
              <Text className="font-vietnam text-body-sm tabular-nums text-muted">
                +84 {address.phone}
              </Text>
              {isDefault ? (
                <View className="rounded-full bg-primary px-2 py-1">
                  <Text className="font-vietnam text-label-sm text-on-primary">
                    Mặc định
                  </Text>
                </View>
              ) : null}
            </View>
            <View
              className={cn(
                "h-6 w-6 items-center justify-center rounded-full border",
                selected ? "border-primary bg-primary" : "border-border-strong",
              )}
            >
              {selected ? <Check color={colors.onPrimary} size={15} /> : null}
            </View>
          </View>
          {address.label ? (
            <View className="flex-row items-center gap-1 self-start rounded-full bg-surface-container px-2 py-1">
              <LabelIcon color={colors.primary} size={14} />
              <Text className="font-vietnam text-label-sm text-ink">
                {address.label === "office" ? "Văn phòng" : "Nhà riêng"}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-start gap-2">
            <MapPin color={colors.primary} size={16} />
            <Text className="flex-1 font-vietnam text-body-sm text-ink">
              {formatDeliveryAddress(address)}
            </Text>
          </View>
          {address.note ? (
            <Text className="rounded bg-surface-soft p-2 font-vietnam text-body-sm text-muted">
              {address.note}
            </Text>
          ) : null}
        </Pressable>
      </NativeViewGestureHandler>
      <NativeViewGestureHandler disallowInterruption>
        <View className="flex-row flex-wrap items-center justify-end gap-x-3 border-t border-border pt-1">
          {!isDefault ? (
            <Pressable
              className="mr-auto min-h-12 justify-center"
              accessibilityRole="button"
              onPress={onSetDefault}
            >
              <Text className="font-vietnam text-label-md text-primary">
                Đặt làm mặc định
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            className="min-h-12 min-w-12 items-center justify-center"
            accessibilityRole="button"
            onPress={onEdit}
          >
            <Text className="font-vietnam text-label-md text-primary">Sửa</Text>
          </Pressable>
          <Pressable
            className="min-h-12 min-w-12 items-center justify-center"
            accessibilityRole="button"
            onPress={onDelete}
          >
            <Text className="font-vietnam text-label-md text-danger">Xóa</Text>
          </Pressable>
        </View>
      </NativeViewGestureHandler>
    </View>
  );
}

export function AddressBookBottomSheet({ onClose }: { onClose: () => void }) {
  const colors = useAppColors();
  const addresses = useCartStore((state) => state.addresses);
  const activeAddress = useCartStore(selectDeliveryAddress);
  const defaultAddressId = useCartStore((state) => state.defaultAddressId);
  const saveAddress = useCartStore((state) => state.saveAddress);
  const selectAddress = useCartStore((state) => state.selectAddress);
  const setDefaultAddress = useCartStore((state) => state.setDefaultAddress);
  const removeAddress = useCartStore((state) => state.removeAddress);
  const [draftId, setDraftId] = useState(activeAddress?.id);
  const [editor, setEditor] = useState<{
    address: SavedDeliveryAddress | null;
  } | null>(null);
  const selectedId = addresses.some((address) => address.id === draftId)
    ? draftId
    : activeAddress?.id;
  const renderScrollComponent = useBottomSheetScrollableCreator();

  function handleSave(nextAddress: DeliveryAddress, makeDefault: boolean) {
    setDraftId(saveAddress(nextAddress, makeDefault, editor?.address?.id));
    setEditor(null);
  }

  function handleDelete(address: SavedDeliveryAddress) {
    Alert.alert("Xóa địa chỉ?", formatDeliveryAddress(address), [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => removeAddress(address.id),
      },
    ]);
  }

  return (
    <CartBottomSheet
      title={
        editor
          ? editor.address
            ? "Sửa địa chỉ nhận hàng"
            : "Thêm địa chỉ nhận hàng mới"
          : "Sổ địa chỉ giao hàng"
      }
      subtitle={editor ? undefined : `${addresses.length} địa chỉ đã lưu`}
      enableContentPanningGesture={!editor}
      icon={
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {editor ? (
            <MapPinPlus color={colors.primary} size={21} />
          ) : (
            <MapPin color={colors.primary} size={21} />
          )}
        </View>
      }
      onBack={editor ? () => setEditor(null) : undefined}
      onClose={onClose}
    >
      {editor ? (
        <DeliveryAddressForm
          address={editor.address}
          isDefault={
            !defaultAddressId || editor.address?.id === defaultAddressId
          }
          onSave={handleSave}
        />
      ) : (
        <>
          <FlashList
            contentContainerStyle={{ padding: 16 }}
            data={addresses}
            keyExtractor={(address) => address.id}
            renderScrollComponent={renderScrollComponent}
            renderItem={({ item }) => (
              <AddressEntry
                address={item}
                selected={selectedId === item.id}
                isDefault={defaultAddressId === item.id}
                onSelect={() => setDraftId(item.id)}
                onEdit={() => setEditor({ address: item })}
                onDelete={() => handleDelete(item)}
                onSetDefault={() => setDefaultAddress(item.id)}
              />
            )}
            // ListHeaderComponent={(
            //   <View className="mb-3 flex-row items-center gap-3 rounded-lg bg-primary/10 px-4 py-3">
            //     <Snowflake color={colors.primary} size={23} />
            //     <View className="flex-1">
            //       <Text className="font-vietnam text-body-emphasis text-primary">Vận chuyển lạnh 6–8°C</Text>
            //       <Text className="font-vietnam text-body-sm text-muted">Giữ nông sản tươi trong quá trình giao hàng.</Text>
            //     </View>
            //   </View>
            // )}
            ListEmptyComponent={
              <View className="items-center rounded-lg border border-card-border px-4 py-6">
                <Text className="font-vietnam text-body-emphasis text-ink">
                  Chưa có địa chỉ nhận hàng
                </Text>
              </View>
            }
            ListFooterComponent={
              <NativeViewGestureHandler disallowInterruption>
                <View className="mt-3">
                  <PrimaryBtn
                    fullWidth
                    variant="secondary"
                    title="Thêm địa chỉ nhận hàng mới"
                    leadingIcon={<Plus color={colors.primary} size={19} />}
                    onPress={() => setEditor({ address: null })}
                  />
                </View>
              </NativeViewGestureHandler>
            }
          />
          <CartSheetFooter>
            <PrimaryBtn
              fullWidth
              title="Xác nhận địa chỉ giao hàng"
              leadingIcon={<CheckCircle2 color={colors.onPrimary} size={20} />}
              disabled={!selectedId}
              onPress={() => {
                if (!selectedId) return;
                selectAddress(selectedId);
                onClose();
              }}
            />
          </CartSheetFooter>
        </>
      )}
    </CartBottomSheet>
  );
}
