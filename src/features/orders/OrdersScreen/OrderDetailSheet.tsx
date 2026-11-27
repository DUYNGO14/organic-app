import { useAppTranslation } from "@/localization/content";
import { useTranslation } from "react-i18next";
import { AppSheet } from "@/components/common/BottomSheet";
import { PrimaryBtn } from "@/components/common";
import { formatPrice } from "@/utils/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { Image } from "expo-image";
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
import { lazy, Suspense, useMemo, type ReactNode } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { CustomerOrder, DeliveryTracking, OrderStatus } from "./orders.data";

const snapPoints = ["92%"];
// Load the native map only on iOS. The Android app has no Maps SDK key.
const AppleMapView = lazy(async () => ({ default: (await import("expo-maps")).AppleMaps.View }));

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
  const { t, localize } = useAppTranslation();
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
        <Text className="font-vietnam text-label-sm text-muted">{t("orders.deliveryMap", { updatedAt: localize(tracking.updatedAt) })}</Text>
      </View>
    </View>
  );
}

function TrackingMap({ tracking }: { tracking: DeliveryTracking }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const showAppleMap = Platform.OS === "ios" && Constants.appOwnership !== "expo";
  const { driverCoordinates, destinationCoordinates } = tracking;

  function openDirections() {
    const origin = `${driverCoordinates.latitude},${driverCoordinates.longitude}`;
    const destination = `${destinationCoordinates.latitude},${destinationCoordinates.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

    void Linking.openURL(url).catch(() => {
      Toast.show({ type: "error", text1: t("orders.couldNotOpenGoogleMaps"), text2: t("farm.pleaseTryAgain") });
    });
  }

  const preview = <TrackingMapFallback tracking={tracking} />;

  return (
    <View className="gap-3">
      {showAppleMap ? (
        <Suspense fallback={preview}>
          <TrackingAppleMap tracking={tracking} />
        </Suspense>
      ) : preview}
      <PrimaryBtn
        fullWidth
        variant="secondary"
        title={t("orders.viewRouteInGoogleMaps")}
        leadingIcon={<Navigation color={colors.primary} size={17} />}
        onPress={openDirections}
      />
    </View>
  );
}

function TrackingAppleMap({ tracking }: { tracking: DeliveryTracking }) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const cameraPosition = useMemo(() => ({
    coordinates: {
      latitude: (tracking.driverCoordinates.latitude + tracking.destinationCoordinates.latitude) / 2,
      longitude: (tracking.driverCoordinates.longitude + tracking.destinationCoordinates.longitude) / 2,
    },
    zoom: 14,
  }), [tracking]);
  return (
    <NativeViewGestureHandler disallowInterruption>
      <View className="h-56 overflow-hidden rounded-lg border border-border bg-surface-container">
        <AppleMapView
          style={StyleSheet.absoluteFill}
          cameraPosition={cameraPosition}
          markers={[
            { id: "courier", coordinates: tracking.driverCoordinates, title: t("orders.driverSLocation"), systemImage: "scooter", tintColor: colors.primary },
            { id: "destination", coordinates: tracking.destinationCoordinates, title: t("cart.deliveryAddress"), systemImage: "house.fill", tintColor: colors.cold },
          ]}
          polylines={[{ id: "delivery-route", coordinates: [...tracking.route], color: colors.primary, width: 7 }]}
        />
        <View pointerEvents="none" className="absolute left-3 top-3 rounded-full bg-surface/95 px-3 py-1.5">
          <Text className="font-vietnam text-label-sm text-primary">{localize(tracking.updatedAt)}</Text>
        </View>
      </View>
    </NativeViewGestureHandler>
  );
}

const timelineByStatus: Record<OrderStatus, readonly string[]> = {
  "pending-payment": ["orders.orderCreated", "orders.waitingForPayment"],
  "awaiting-shipment": ["orders.orderConfirmed", "orders.theFarmIsPackingYourItems"],
  "awaiting-receipt": ["orders.orderConfirmed", "orders.handedOverToTheCarrier", "orders.yourDriverIsOnTheWay"],
  review: ["orders.orderConfirmed", "orders.handedOverToTheCarrier", "orders.deliveredSuccessfully"],
  return: ["orders.returnRequestReceived", "orders.reviewingYourRequest"],
};

function OrderTimeline({ order }: { order: CustomerOrder }) {
  const { t } = useTranslation();
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
            <Text className={`min-w-0 flex-1 pt-1 font-vietnam text-body-sm ${current ? "text-primary" : "text-muted"}`}>{t(step)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function OrderDetailSheet({ order, onClose }: { order: CustomerOrder; onClose: () => void }) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const { bottom } = useSafeAreaInsets();
  const tracking = order.tracking;

  return (
    <AppSheet
      header={{
        title: tracking ? t("orders.orderTracking") : t("orders.orderDetails"),
        actionLabel: t("orders.closeOrderDetails"),
        subtitle: `#${order.id} · ${localize(order.statusLabel)}`,
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
                  <Text className="font-vietnam text-label-sm text-on-primary-container">{t("orders.estimatedDelivery")}</Text>
                  <Text className="font-vietnam text-title-md text-on-primary-container">{localize(tracking.eta)}</Text>
                  <Text className="font-vietnam text-body-sm text-on-primary-container">{t("orders.left", { distance: tracking.distance })}</Text>
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
                    title={t("orders.callTheDriver")}
                    variant="secondary"
                    className="flex-1"
                    leadingIcon={<Phone color={colors.primary} size={17} />}
                    onPress={() => Linking.openURL(`tel:${tracking.courierPhone.replace(/\s/g, "")}`)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded border border-border bg-surface-soft px-3 active:bg-surface-container"
                    onPress={() => Toast.show({ type: "info", text1: t("orders.chatWithTheDriver"), text2: t("orders.chatWillBeAvailableWhenThe") })}
                  >
                    <MessageCircle color={colors.primary} size={17} />
                    <Text className="font-vietnam text-label-md text-primary">{t("orders.message")}</Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-3 rounded-lg bg-surface-soft p-4">
                <InfoRow icon={<Navigation color={colors.onPrimaryContainer} size={17} />} label={t("orders.currentLocation")} value={tracking.currentLocation} />
                <InfoRow icon={<MapPin color={colors.onPrimaryContainer} size={17} />} label={t("orders.deliverTo")} value={tracking.destination} />
              </View>
            </>
          ) : null}

          <View className="gap-2">
            <Text className="font-vietnam text-body-emphasis text-ink">{t("orders.orderProgress")}</Text>
            <OrderTimeline order={order} />
          </View>

          <View className="gap-3">
            <Text className="font-vietnam text-body-emphasis text-ink">{t("notifications.products")}</Text>
            {order.items.map(({ product, quantity }) => (
              <View key={product.id} className="flex-row items-center gap-3 rounded-md bg-surface-soft p-3">
                <View className="h-14 w-14 overflow-hidden rounded bg-surface-container">
                  <Image source={product.image} contentFit="cover" style={StyleSheet.absoluteFill} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={2} className="font-vietnam text-body-emphasis text-ink">{localize(product.name)}</Text>
                  <Text className="font-vietnam text-body-sm text-muted">x{quantity} · {formatPrice(product.price * quantity)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
            <InfoRow icon={<MapPin color={colors.onPrimaryContainer} size={17} />} label={t("cart.deliveryAddress")} value={order.shippingAddress} />
            <InfoRow icon={<ReceiptText color={colors.onPrimaryContainer} size={17} />} label={t("orders.payment")} value={localize(order.paymentMethod)} />
            <View className="flex-row items-center justify-between border-t border-border pt-3">
              <Text className="font-vietnam text-label-md text-muted">{t("orders.subtotal")}</Text>
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-title-md text-primary">{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </AppSheet>
  );
}
