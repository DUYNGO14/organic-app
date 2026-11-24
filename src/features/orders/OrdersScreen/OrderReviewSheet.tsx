import { AppSheet, SheetFooter, type AppSheetHandle } from "@/components/common/BottomSheet";
import { IconButton, PrimaryBtn } from "@/components/common";
import { SheetTextInput } from "@/components/common/Input/SheetTextInput";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Camera, Star, X } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ReviewPhotoCamera } from "./ReviewPhotoCamera";
import type { CustomerOrder } from "./orders.data";

export type OrderReview = {
  orderId: string;
  rating: number;
  comment: string;
  photoUris: readonly string[];
};

const snapPoints = ["82%"];
const maxReviewPhotos = 3;
const ratingLabels = [
  "Rất tệ",
  "Chưa tốt",
  "Bình thường",
  "Hài lòng",
  "Rất hài lòng",
];

export function OrderReviewSheet({
  order,
  onClose,
  onSubmit,
}: {
  order: CustomerOrder;
  onClose: () => void;
  onSubmit: (review: OrderReview) => void;
}) {
  const sheet = useRef<AppSheetHandle>(null);
  const pendingReview = useRef<OrderReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const colors = useAppColors();
  const firstItem = order.items[0];
  const dismiss = useCallback(() => sheet.current?.dismiss(), []);

  const handleDismiss = useCallback(() => {
    const review = pendingReview.current;
    pendingReview.current = null;
    if (review) onSubmit(review);
    else onClose();
  }, [onClose, onSubmit]);

  return (
    <AppSheet
      header={{
        title: "Đánh giá đơn hàng",
        actionLabel: "Đóng đánh giá",
        subtitle: `#${order.id}`,
      }}
      ref={sheet}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onDismiss={handleDismiss}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View className="gap-5">
          <View className="flex-row items-center gap-3 rounded-lg bg-surface-soft p-3">
            <View className="h-16 w-16 overflow-hidden rounded bg-surface-container">
              <Image
                source={firstItem.product.image}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                numberOfLines={2}
                className="font-vietnam text-body-emphasis text-ink"
              >
                {firstItem.product.name}
              </Text>
              <Text className="font-vietnam text-body-sm text-muted">
                {order.items.length > 1
                  ? `và ${order.items.length - 1} sản phẩm khác`
                  : firstItem.product.subtitle}
              </Text>
            </View>
          </View>

          <View className="items-center gap-3">
            <Text className="font-vietnam text-body-emphasis text-ink">
              Bạn hài lòng với đơn hàng này?
            </Text>
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
                  <Star
                    color={rating >= value ? colors.rating : colors.border}
                    fill={rating >= value ? colors.rating : "none"}
                    size={32}
                  />
                </Pressable>
              ))}
            </View>
            <Text
              accessibilityLiveRegion="polite"
              className={`font-vietnam text-label-md ${rating ? "text-primary" : "text-muted"}`}
            >
              {rating ? ratingLabels[rating - 1] : "Chạm để chọn số sao"}
            </Text>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="font-vietnam text-label-md text-ink">
                Nhận xét của bạn
              </Text>
              <Text className="font-vietnam text-label-sm text-muted">
                {comment.length}/500
              </Text>
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

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="font-vietnam text-label-md text-ink">
                Ảnh sản phẩm
              </Text>
              <Text className="font-vietnam text-label-sm tabular-nums text-muted">
                {photoUris.length}/{maxReviewPhotos}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {photoUris.map((uri, index) => (
                <View
                  key={uri}
                  className="h-20 w-20 overflow-hidden rounded-lg bg-surface-container"
                >
                  <Image
                    accessibilityLabel={`Ảnh sản phẩm ${index + 1}`}
                    contentFit="cover"
                    source={uri}
                    style={StyleSheet.absoluteFill}
                  />
                  <IconButton
                    className="absolute right-1 top-1"
                    icon={<X size={16} color={colors.ink} />}
                    label={`Xoá ảnh ${index + 1}`}
                    size="sm"
                    variant="outlined"
                    onPress={() =>
                      setPhotoUris((current) =>
                        current.filter((photo) => photo !== uri),
                      )
                    }
                  />
                </View>
              ))}
              {photoUris.length < maxReviewPhotos ? (
                <Pressable
                  accessibilityLabel="Chụp ảnh"
                  accessibilityRole="button"
                  className="h-20 w-20 items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface-soft active:bg-surface-container"
                  onPress={() => {
                    Keyboard.dismiss();
                    setCameraOpen(true);
                  }}
                >
                  <Camera size={21} color={colors.primary} />
                  <Text className="font-vietnam text-label-sm text-primary">
                    Chụp ảnh
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </BottomSheetScrollView>

      <SheetFooter>
        <PrimaryBtn
          disabled={rating === 0}
          fullWidth
          title="Gửi đánh giá"
          onPress={() => {
            pendingReview.current = {
              orderId: order.id,
              rating,
              comment: comment.trim(),
              photoUris,
            };
            dismiss();
          }}
        />
      </SheetFooter>
      {cameraOpen ? (
        <ReviewPhotoCamera
          onClose={() => setCameraOpen(false)}
          onAttach={(uri) => {
            setPhotoUris((current) =>
              current.length < maxReviewPhotos && !current.includes(uri)
                ? [...current, uri]
                : current,
            );
            setCameraOpen(false);
          }}
        />
      ) : null}
    </AppSheet>
  );
}
