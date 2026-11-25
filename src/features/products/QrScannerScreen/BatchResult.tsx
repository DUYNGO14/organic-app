import { PrimaryBtn } from "@/components/common";
import { SkeletonBlock, SkeletonGroup } from "@/components/common/Skeleton";
import { useTraceabilityBatch } from "@/features/products/traceability.queries";
import { Text, View } from "react-native";

const harvestFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function BatchResult({
  batchCode,
  active,
  onOpenProduct,
}: {
  batchCode: string;
  active: boolean;
  onOpenProduct: (productId: string) => void;
}) {
  const query = useTraceabilityBatch(batchCode);

  if (query.isLoading) {
    return (
      <SkeletonGroup active={active} label="Đang tra cứu nguồn gốc">
        <View className="gap-4 rounded-lg border border-card-border bg-surface p-4">
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </View>
      </SkeletonGroup>
    );
  }

  if (query.data === undefined) {
    return (
      <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
        <Text accessibilityRole="alert" className="font-vietnam text-body-emphasis text-ink">
          {query.isPaused ? "Đang ngoại tuyến" : "Chưa thể tra cứu nguồn gốc"}
        </Text>
        <Text className="font-vietnam text-body-sm text-muted">
          Kiểm tra kết nối rồi thử tra cứu lại mã lô {batchCode}.
        </Text>
        <PrimaryBtn
          title="Thử lại"
          loading={query.isFetching}
          variant="secondary"
          onPress={() => void query.refetch()}
        />
      </View>
    );
  }

  const batch = query.data;
  if (!batch) {
    return (
      <View className="gap-2 rounded-lg border border-card-border bg-surface p-4">
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="font-vietnam text-title-md text-ink">
          Không tìm thấy lô {batchCode}
        </Text>
        <Text className="font-vietnam text-body-md text-muted">
          Kiểm tra mã trên bao bì hoặc thử quét mã khác.
        </Text>
      </View>
    );
  }

  const details = [
    { label: "Mã lô", value: batch.code },
    { label: "Nông trại", value: batch.farmName },
    { label: "Vùng trồng", value: batch.growingRegion },
    { label: "Thu hoạch", value: harvestFormatter.format(new Date(batch.harvestedAt)) },
  ];

  return (
    <>
      <View className="gap-4 rounded-lg border border-card-border bg-surface p-4">
        <Text className="self-start rounded-full bg-warning-container px-3 py-1 font-vietnam text-label-sm text-warning">
          Dữ liệu mẫu
        </Text>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="font-vietnam text-headline-sm text-ink">
          {batch.productName}
        </Text>
        {details.map(({ label, value }) => (
          <View key={label} className="gap-1 border-t border-border pt-3">
            <Text className="font-vietnam text-label-md text-muted">{label}</Text>
            <Text className="font-vietnam text-body-md text-ink">{value}</Text>
          </View>
        ))}
      </View>
      <PrimaryBtn fullWidth title="Xem sản phẩm" onPress={() => onOpenProduct(batch.productId)} />
    </>
  );
}
