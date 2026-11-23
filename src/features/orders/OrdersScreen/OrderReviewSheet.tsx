import { IconButton, PrimaryBtn } from "@/components/common";
import { SheetTextInput } from "@/components/common/Input/SheetTextInput";
import { useAppColors } from "@/hooks/use-app-colors";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Star, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { CustomerOrder } from "./orders.data";

export type OrderReview = { orderId: string; rating: number; comment: string };

const snapPoints = ["82%"];
const ratingLabels = ["Rất tệ", "Chưa tốt", "Bình thường", "Hài lòng", "Rất hài lòng"];

function ReviewBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} accessible={false} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />;
}

function ReviewBackground({ style }: BottomSheetBackgroundProps) {
  return <View pointerEvents="none" className="rounded-t-lg border border-card-border bg-surface" style={style} />;
}

export function OrderReviewSheet({
  order,
  onClose,
  onSubmit,
}: {
  order: CustomerOrder;
  onClose: () => void;
  onSubmit: (review: OrderReview) => void;
}) {
  const sheet = useRef<BottomSheetModal>(null);
  const pendingReview = useRef<OrderReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const colors = useAppColors();
  const { top, bottom } = useSafeAreaInsets();
  const firstItem = order.items[0];
  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    sheet.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    const review = pendingReview.current;
    pendingReview.current = null;
    if (review) onSubmit(review);
    else onClose();
  }, [onClose, onSubmit]);

  useEffect(() => {
    sheet.current?.present();
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheetModal
      ref={sheet}
      snapPoints={snapPoints}
      topInset={top}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={ReviewBackdrop}
      backgroundComponent={ReviewBackground}
      handleIndicatorStyle={{ backgroundColor: colors.muted }}
      onDismiss={handleDismiss}
    >
      <View className="flex-1" accessibilityViewIsModal onAccessibilityEscape={dismiss}>
        <View className="min-h-12 flex-row items-center gap-2 border-b border-border px-4 pb-2">
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">Đánh giá đơn hàng</Text>
            <Text className="font-vietnam text-body-sm text-muted">#{order.id}</Text>
          </View>
          <IconButton icon={<X color={colors.ink} size={21} />} label="Đóng đánh giá" size="lg" onPress={dismiss} />
        </View>

        <BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <View className="gap-5">
            <View className="flex-row items-center gap-3 rounded-lg bg-surface-soft p-3">
              <View className="h-16 w-16 overflow-hidden rounded bg-surface-container">
                <Image source={firstItem.product.image} contentFit="cover" style={StyleSheet.absoluteFill} />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text numberOfLines={2} className="font-vietnam text-body-emphasis text-ink">{firstItem.product.name}</Text>
                <Text className="font-vietnam text-body-sm text-muted">
                  {order.items.length > 1 ? `và ${order.items.length - 1} sản phẩm khác` : firstItem.product.subtitle}
                </Text>
              </View>
            </View>

            <View className="items-center gap-3">
              <Text className="font-vietnam text-body-emphasis text-ink">Bạn hài lòng với đơn hàng này?</Text>
              <View className="w-full flex-row" accessibilityRole="radiogroup">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    accessibilityLabel={`${value} sao, ${ratingLabels[value - 1]}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: rating === value }}
                    className="min-h-12 flex-1 items-center justify-center rounded active:bg-surface-container"
                    onPress={() => setRating(value)}
                  >
                    <Star color={rating >= value ? colors.rating : colors.border} fill={rating >= value ? colors.rating : "none"} size={32} />
                  </Pressable>
                ))}
              </View>
              <Text accessibilityLiveRegion="polite" className={`font-vietnam text-label-md ${rating ? "text-primary" : "text-muted"}`}>
                {rating ? ratingLabels[rating - 1] : "Chạm để chọn số sao"}
              </Text>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="font-vietnam text-label-md text-ink">Nhận xét của bạn</Text>
                <Text className="font-vietnam text-label-sm text-muted">{comment.length}/500</Text>
              </View>
              <SheetTextInput
                accessibilityLabel="Nhận xét đơn hàng"
                className="min-h-28 rounded-lg border border-border-strong bg-surface-container-low px-4 py-3 font-vietnam text-body-md text-ink"
                maxLength={500}
                multiline
                onChangeText={setComment}
                placeholder="Chia sẻ về độ tươi, cách đóng gói và giao hàng..."
                placeholderTextColor={colors.muted}
                textAlignVertical="top"
                value={comment}
              />
            </View>
          </View>
        </BottomSheetScrollView>

        <View className="border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: bottom + 12 }}>
          <PrimaryBtn
            disabled={rating === 0}
            fullWidth
            title="Gửi đánh giá"
            onPress={() => {
              pendingReview.current = { orderId: order.id, rating, comment: comment.trim() };
              dismiss();
            }}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

