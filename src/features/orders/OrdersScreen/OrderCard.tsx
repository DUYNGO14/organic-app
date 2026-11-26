import { PrimaryBtn } from "@/components/common";
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import {
  CircleCheck,
  Clock3,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import type { OrderReview } from "./OrderReviewSheet";
import type { CustomerOrder, OrderStatus } from "./orders.data";

const statusStyles: Record<OrderStatus, string> = {
  "pending-payment": "bg-warning-container text-warning",
  "awaiting-shipment": "bg-surface-container text-primary",
  "awaiting-receipt": "bg-cold-container text-cold",
  review: "bg-secondary-container text-on-secondary-container",
  return: "bg-danger-container text-on-danger-container",
};

const statusIcons: Record<OrderStatus, LucideIcon> = {
  "pending-payment": CreditCard,
  "awaiting-shipment": PackageCheck,
  "awaiting-receipt": Truck,
  review: CircleCheck,
  return: RotateCcw,
};

function actionLabel(status: OrderStatus) {
  if (status === "pending-payment") return "Thanh toán ngay";
  if (status === "awaiting-receipt") return "Theo dõi đơn";
  if (status === "review") return "Viết đánh giá";
  if (status === "return") return "Xem tiến trình";
  return "Xem chi tiết";
}

export function OrderCard({
  order,
  review,
  onAction,
}: {
  order: CustomerOrder;
  review?: OrderReview;
  onAction: (order: CustomerOrder) => void;
}) {
  const colors = useAppColors();
  const reviewed = Boolean(review);
  const StatusIcon = statusIcons[order.status];
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const statusIconColor = order.status === "return"
    ? colors.danger
    : order.status === "pending-payment"
      ? colors.warning
      : order.status === "awaiting-receipt"
        ? colors.cold
        : colors.primary;

  return (
    <View className="w-full max-w-3xl self-center overflow-hidden rounded-lg border border-card-border bg-surface">
      <View className="flex-row flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-vietnam text-label-md text-ink">#{order.id}</Text>
          <Text className="font-vietnam text-label-sm text-muted">Đặt lúc {order.placedAt}</Text>
        </View>
        <View className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${statusStyles[order.status].split(" ")[0]}`}>
          <StatusIcon color={statusIconColor} size={15} />
          <Text className={`font-vietnam text-label-sm ${reviewed ? "text-muted" : statusStyles[order.status].split(" ")[1]}`}>
            {reviewed ? "Đã đánh giá" : order.statusLabel}
          </Text>
        </View>
      </View>

      <View className="gap-3 p-4">
        {order.items.map(({ product, quantity: itemQuantity }) => (
          <View key={product.id} className="flex-row items-center gap-3">
            <View className="h-16 w-16 overflow-hidden rounded bg-surface-container">
              <Image source={product.image} contentFit="cover" style={StyleSheet.absoluteFill} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text numberOfLines={2} className="font-vietnam text-body-emphasis text-ink">
                {product.name}
              </Text>
              <Text className="font-vietnam text-body-sm text-muted">{product.subtitle}</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="font-vietnam text-body-sm text-muted">x{itemQuantity}</Text>
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-label-md text-ink">
                {formatPrice(product.price * itemQuantity)}
              </Text>
            </View>
          </View>
        ))}

        <View className="flex-row items-start gap-2 rounded-md bg-surface-soft p-3">
          <Clock3 color={statusIconColor} size={17} />
          <Text className="min-w-0 flex-1 font-vietnam text-body-sm text-muted">{order.statusDetail}</Text>
        </View>

        {review?.photoUris.length ? (
          <View className="gap-2">
            <Text className="font-vietnam text-label-md text-ink">Ảnh đánh giá của bạn</Text>
            <View className="flex-row flex-wrap gap-2">
              {review.photoUris.map((uri, index) => (
                <View key={uri} className="h-16 w-16 overflow-hidden rounded bg-surface-container">
                  <Image accessibilityLabel={`Ảnh đánh giá ${index + 1}`} contentFit="cover" source={uri} style={StyleSheet.absoluteFill} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="flex-row flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="font-vietnam text-body-sm text-muted">
              {quantity} sản phẩm · {order.paymentMethod}
            </Text>
            <View className="flex-row flex-wrap items-baseline gap-2">
              <Text className="font-vietnam text-label-md text-muted">Thành tiền</Text>
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-title-md text-primary">
                {formatPrice(order.total)}
              </Text>
            </View>
          </View>
          {reviewed ? null : (
            <PrimaryBtn title={actionLabel(order.status)} variant={order.status === "review" ? "primary" : "secondary"} onPress={() => onAction(order)} />
          )}
        </View>
      </View>
    </View>
  );
}

