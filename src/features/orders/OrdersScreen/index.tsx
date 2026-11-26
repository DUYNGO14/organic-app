import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { PrimaryBtn } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { FlashList } from "@shopify/flash-list";
import { ClipboardList, PackageSearch } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { OrderCard } from "./OrderCard";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrderReviewSheet, type OrderReview } from "./OrderReviewSheet";
import { demoOrders, orderFilters, type CustomerOrder, type OrderFilter } from "./orders.data";

export default function OrdersScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const colors = useAppColors();
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
  const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);
  const [reviews, setReviews] = useState<Partial<Record<string, OrderReview>>>({});

  const visibleOrders = useMemo(
    () => demoOrders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      return order.status !== "review" || !reviews[order.id] || filter === "all";
    }),
    [filter, reviews],
  );

  function countForFilter(nextFilter: OrderFilter) {
    if (nextFilter === "all") return demoOrders.length;
    return demoOrders.filter((order) => order.status === nextFilter && !reviews[order.id]).length;
  }

  function handleOrderAction(order: CustomerOrder) {
    if (order.status === "review") {
      setReviewOrder(order);
      return;
    }

    if (order.status !== "pending-payment") {
      setDetailOrder(order);
      return;
    }

    Toast.show({
      type: "success",
      text1: order.statusLabel,
      text2: order.statusDetail,
    });
  }

  function submitReview(review: OrderReview) {
    setReviews((current) => ({ ...current, [review.orderId]: review }));
    setReviewOrder(null);
    Toast.show({
      type: "success",
      text1: "Đã gửi đánh giá",
      text2: `Cảm ơn bạn đã đánh giá ${review.rating} sao.`,
    });
  }

  if (isLoading) return <ScreenSkeleton variant="orders" />;

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="border-b border-border bg-canvas pb-3 pt-2"
        accessibilityElementsHidden={reviewOrder !== null || detailOrder !== null}
        importantForAccessibility={reviewOrder || detailOrder ? "no-hide-descendants" : "auto"}
      >
        <View className="flex-row items-center gap-3 px-4 pb-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-container">
            <ClipboardList color={colors.primary} size={22} />
          </View>
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="font-vietnam text-headline-sm text-ink">Đơn hàng của bạn</Text>
            <Text className="font-vietnam text-body-sm text-muted">Theo dõi trạng thái và trải nghiệm sau mua</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {orderFilters.map(({ id, label }) => {
            const selected = filter === id;
            const count = countForFilter(id);
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`min-h-12 flex-row items-center gap-2 rounded-full border px-4 ${selected ? "border-primary bg-primary" : "border-border bg-surface active:bg-surface-soft"}`}
                onPress={() => setFilter(id)}
              >
                <Text className={`font-vietnam text-label-md ${selected ? "text-on-primary" : "text-ink"}`}>{label}</Text>
                <View className={`min-w-5 items-center rounded-full px-1.5 py-0.5 ${selected ? "bg-on-primary/20" : "bg-surface-container"}`}>
                  <Text className={`font-vietnam text-label-sm ${selected ? "text-on-primary" : "text-muted"}`}>{count}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlashList
        className="flex-1 bg-canvas"
        contentContainerStyle={{ padding: 16 }}
        data={visibleOrders}
        keyExtractor={(order) => order.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            review={reviews[item.id]}
            onAction={handleOrderAction}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="items-center gap-3 px-6 py-16">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-container">
              <PackageSearch color={colors.primary} size={30} />
            </View>
            <Text className="text-center font-vietnam text-title-md text-ink">Chưa có đơn hàng ở trạng thái này</Text>
            <Text className="text-center font-vietnam text-body-sm text-muted">Các đơn mới sẽ xuất hiện tại đây khi trạng thái được cập nhật.</Text>
            <PrimaryBtn title="Xem tất cả đơn" variant="secondary" onPress={() => setFilter("all")} />
          </View>
        }
      />

      {reviewOrder ? (
        <OrderReviewSheet order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={submitReview} />
      ) : null}
      {detailOrder ? <OrderDetailSheet order={detailOrder} onClose={() => setDetailOrder(null)} /> : null}
    </View>
  );
}

