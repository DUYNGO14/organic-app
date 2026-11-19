import type { HomeProduct } from "@/features/home/home.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Star } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const reviews = [
  { initials: "MH", name: "Minh Hằng (Q.7, TP.HCM)", date: "Hôm qua", text: "Rau giao đến còn đọng sương, lá tươi và giòn. Đóng gói cẩn thận, mình sẽ đặt lại mỗi tuần!" },
  { initials: "VT", name: "Văn Tuấn (Bình Thạnh)", date: "3 ngày trước", text: "Nguồn gốc rõ ràng, sản phẩm đúng mô tả. Trải nghiệm mua hàng rất yên tâm." },
];

export function ProductReviewsCard({ product, colors }: { product: HomeProduct; colors: AppColors }) {
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-vietnam text-title-md text-ink">Đánh giá từ khách hàng</Text>
        <View className="flex-row items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1"><Star color={colors.secondary} fill={colors.secondary} size={14} /><Text className="font-vietnam text-label-sm text-on-secondary-container">{product.rating ?? "4.9"}</Text></View>
      </View>
      {reviews.map((review) => (
        <View key={review.initials} className="mb-2.5 rounded-xl bg-surface-container-low p-3 last:mb-0">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary-container"><Text className="font-vietnam text-label-sm text-on-secondary-container">{review.initials}</Text></View>
            <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{review.name}</Text><View className="mt-0.5 flex-row">{Array.from({ length: 5 }, (_, index) => <Star key={index} color="#F59E0B" fill="#F59E0B" size={12} />)}</View></View>
            <Text className="font-vietnam text-body-sm text-muted">{review.date}</Text>
          </View>
          <Text className="mt-2 font-vietnam text-body-md text-ink">{review.text}</Text>
        </View>
      ))}
    </DetailCard>
  );
}
