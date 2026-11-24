import { AppSheet } from "@/components/common/BottomSheet";
import { PrimaryBtn } from "@/components/common";
import { formatPrice } from "@/features/products/ProductDetailScreen/components/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { AppleMaps, GoogleMaps } from "expo-maps";
import {
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react-native";
import { useMemo, type ReactNode } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { CustomerOrder, DeliveryTracking, OrderStatus } from "./orders.data";

const snapPoints = ["92%"];

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-primary-container">{icon}</View>
      <View className="min-w-0 flex-1">
        <Text className="font-vietnam text-label-sm text-muted">{label}</Text>
        <Text className="font-vietnam text-body-sm text-ink">{value}</Text>
      </View>
    </View>
  );
}

function TrackingMapFallback({ tracking }: { tracking: DeliveryTracking }) {
  const colors = useAppColors();

  return (
    <View className="h-56 overflow-hidden rounded-lg border border-border bg-surface-container">
      <View className="absolute left-0 right-0 top-12 h-px rotate-12 bg-border-strong" />
      <View className="absolute left-10 right-4 top-32 h-px -rotate-6 bg-border-strong" />
      <View className="absolute bottom-0 top-0 left-28 w-px rotate-12 bg-border-strong" />
      <View className="absolute left-20 top-24 h-2 w-44 rotate-12 rounded-full bg-primary/60" />
      <View className="absolute left-16 top-20 h-12 w-12 items-center justify-center rounded-full border-4 border-surface bg-primary">
        <Truck color={colors.onPrimary} size={20} />
      </View>
      <View className="absolute right-16 top-32 h-12 w-12 items-center justify-center rounded-full border-4 border-surface bg-cold-container">
        <MapPin color={colors.cold} size={20} />
      </View>
      <View className="absolute bottom-3 left-3 right-3 rounded-md bg-surface/95 p-2">
        <Text numberOfLines={1} className="font-vietnam text-label-sm text-ink">{tracking.currentLocation}</Text>
        <Text className="font-vietnam text-label-sm text-muted">Bản đồ trực tiếp khả dụng trong development build</Text>
      </View>
    </View>
  );
}

function TrackingMap({ tracking }: { tracking: DeliveryTracking }) {
  const colors = useAppColors();
  const cameraPosition = useMemo(() => ({
    coordinates: {
      latitude: (tracking.driverCoordinates.latitude + tracking.destinationCoordinates.latitude) / 2,
      longitude: (tracking.driverCoordinates.longitude + tracking.destinationCoordinates.longitude) / 2,
    },
    zoom: 14,
  }), [tracking]);
  const isExpoGo = Constants.appOwnership === "expo";

  if (isExpoGo || Platform.OS === "web") return <TrackingMapFallback tracking={tracking} />;

  return (
    <NativeViewGestureHandler disallowInterruption>
      <View className="h-56 overflow-hidden rounded-lg border border-border bg-surface-container">
        {Platform.OS === "android" ? (
          <GoogleMaps.View
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={[
              { id: "courier", coordinates: tracking.driverCoordinates, title: "Tài xế đang ở đây", snippet: tracking.currentLocation, showCallout: true },
              { id: "destination", coordinates: tracking.destinationCoordinates, title: "Địa chỉ nhận hàng", snippet: tracking.destination, showCallout: true },
            ]}
            polylines={[{ id: "delivery-route", coordinates: [...tracking.route], color: colors.primary, width: 7 }]}
          />
        ) : (
          <AppleMaps.View
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={[
              { id: "courier", coordinates: tracking.driverCoordinates, title: "Tài xế đang ở đây", systemImage: "scooter", tintColor: colors.primary },
              { id: "destination", coordinates: tracking.destinationCoordinates, title: "Địa chỉ nhận hàng", systemImage: "house.fill", tintColor: colors.cold },
            ]}
            polylines={[{ id: "delivery-route", coordinates: [...tracking.route], color: colors.primary, width: 7 }]}
          />
        )}
        <View pointerEvents="none" className="absolute left-3 top-3 rounded-full bg-surface/95 px-3 py-1.5">
          <Text className="font-vietnam text-label-sm text-primary">{tracking.updatedAt}</Text>
        </View>
      </View>
    </NativeViewGestureHandler>
  );
}

const timelineByStatus: Record<OrderStatus, readonly string[]> = {
  "pending-payment": ["Đơn hàng đã được tạo", "Đang chờ hoàn tất thanh toán"],
  "awaiting-shipment": ["Đơn hàng đã được xác nhận", "Nông trại đang đóng gói sản phẩm"],
  "awaiting-receipt": ["Đơn hàng đã được xác nhận", "Đã bàn giao cho đơn vị vận chuyển", "Tài xế đang giao đến bạn"],
  review: ["Đơn hàng đã được xác nhận", "Đã bàn giao cho đơn vị vận chuyển", "Giao hàng thành công"],
  return: ["Đã tiếp nhận yêu cầu trả hàng", "Đang kiểm tra và xử lý yêu cầu"],
};

function OrderTimeline({ order }: { order: CustomerOrder }) {
  const colors = useAppColors();
  const steps = timelineByStatus[order.status];

  return (
    <View className="rounded-lg bg-surface-soft p-4">
      {steps.map((step, index) => {
        const current = index === steps.length - 1;
        return (
          <View key={step} className="flex-row gap-3">
            <View className="items-center">
              <View className={`h-7 w-7 items-center justify-center rounded-full ${current ? "bg-primary" : "bg-primary-container"}`}>
                {current ? <Clock3 color={colors.onPrimary} size={14} /> : <Check color={colors.onPrimaryContainer} size={14} />}
              </View>
              {index < steps.length - 1 ? <View className="h-8 w-px bg-border-strong" /> : null}
            </View>
            <Text className={`min-w-0 flex-1 pt-1 font-vietnam text-body-sm ${current ? "text-primary" : "text-muted"}`}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function OrderDetailSheet({ order, onClose }: { order: CustomerOrder; onClose: () => void }) {
  const colors = useAppColors();
  const { bottom } = useSafeAreaInsets();
  const tracking = order.tracking;

  return (
    <AppSheet
      header={{
        title: tracking ? "Theo dõi đơn hàng" : "Chi tiết đơn hàng",
        actionLabel: "Đóng chi tiết đơn hàng",
        subtitle: `#${order.id} · ${order.statusLabel}`,
        className: "gap-3",
        icon: (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
            {tracking ? <Navigation color={colors.onPrimaryContainer} size={20} /> : <ReceiptText color={colors.onPrimaryContainer} size={20} />}
          </View>
        ),
      }}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onDismiss={onClose}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View className="gap-5">
          {tracking ? (
            <>
              <View className="flex-row items-center justify-between gap-3 rounded-lg bg-primary-container p-4">
                <View className="min-w-0 flex-1">
                  <Text className="font-vietnam text-label-sm text-on-primary-container">Dự kiến giao tới</Text>
                  <Text className="font-vietnam text-title-md text-on-primary-container">{tracking.eta}</Text>
                  <Text className="font-vietnam text-body-sm text-on-primary-container">Còn {tracking.distance}</Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Truck color={colors.onPrimary} size={23} />
                </View>
              </View>

              <TrackingMap tracking={tracking} />

              <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                    <UserRound color={colors.primary} size={23} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-vietnam text-body-emphasis text-ink">{tracking.courierName}</Text>
                    <Text className="font-vietnam text-body-sm text-muted">{tracking.vehicle}</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <PrimaryBtn
                    title="Gọi tài xế"
                    variant="secondary"
                    className="flex-1"
                    leadingIcon={<Phone color={colors.primary} size={17} />}
                    onPress={() => Linking.openURL(`tel:${tracking.courierPhone.replace(/\s/g, "")}`)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded border border-border bg-surface-soft px-3 active:bg-surface-container"
                    onPress={() => Toast.show({ type: "info", text1: "Nhắn tin với tài xế", text2: "Kênh trò chuyện sẽ được kết nối khi có backend vận chuyển." })}
                  >
                    <MessageCircle color={colors.primary} size={17} />
                    <Text className="font-vietnam text-label-md text-primary">Nhắn tin</Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-3 rounded-lg bg-surface-soft p-4">
                <InfoRow icon={<Navigation color={colors.onPrimaryContainer} size={17} />} label="Vị trí hiện tại" value={tracking.currentLocation} />
                <InfoRow icon={<MapPin color={colors.onPrimaryContainer} size={17} />} label="Giao đến" value={tracking.destination} />
              </View>
            </>
          ) : null}

          <View className="gap-2">
            <Text className="font-vietnam text-body-emphasis text-ink">Tiến trình đơn hàng</Text>
            <OrderTimeline order={order} />
          </View>

          <View className="gap-3">
            <Text className="font-vietnam text-body-emphasis text-ink">Sản phẩm</Text>
            {order.items.map(({ product, quantity }) => (
              <View key={product.id} className="flex-row items-center gap-3 rounded-md bg-surface-soft p-3">
                <View className="h-14 w-14 overflow-hidden rounded bg-surface-container">
                  <Image source={product.image} contentFit="cover" style={StyleSheet.absoluteFill} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={2} className="font-vietnam text-body-emphasis text-ink">{product.name}</Text>
                  <Text className="font-vietnam text-body-sm text-muted">x{quantity} · {formatPrice(product.price * quantity)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
            <InfoRow icon={<MapPin color={colors.onPrimaryContainer} size={17} />} label="Địa chỉ nhận hàng" value={order.shippingAddress} />
            <InfoRow icon={<ReceiptText color={colors.onPrimaryContainer} size={17} />} label="Thanh toán" value={order.paymentMethod} />
            <View className="flex-row items-center justify-between border-t border-border pt-3">
              <Text className="font-vietnam text-label-md text-muted">Thành tiền</Text>
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-title-md text-primary">{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </AppSheet>
  );
}
