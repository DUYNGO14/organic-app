import { IconButton, PrimaryBtn, StepperBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { dealProducts, recommendedProducts, type HomeProduct } from "@/features/home/home.data";
import { getProductDetailSpec } from "@/features/products/product-detail.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import {
  Activity,
  AlarmClock,
  ArrowRight,
  Award,
  BadgeCheck,
  Clock3,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Utensils,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";

const products: HomeProduct[] = [...dealProducts, ...recommendedProducts];

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

function DetailCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest p-4 shadow-sm dark:border-[#00E676]/[0.12] ${className}`}>
      {children}
    </View>
  );
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useAppColors();
  const product = products.find((item) => item.id === productId);
  const spec = useMemo(() => product ? getProductDetailSpec(product) : null, [product]);
  const [imageIndex, setImageIndex] = useState(0);
  const [packageIndex, setPackageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product || !spec) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="font-vietnam text-headline-sm text-ink">Không tìm thấy sản phẩm</Text>
        <PrimaryBtn className="mt-4" title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  const selectedPackage = spec.packages[packageIndex] ?? spec.packages[0];
  const discount = selectedPackage.oldPrice
    ? Math.round((1 - selectedPackage.price / selectedPackage.oldPrice) * 100)
    : product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;
  const currentImage = spec.gallery[imageIndex] ?? product.image;

  function confirmAddToCart() {
    Alert.alert("Đã thêm vào giỏ", `${quantity} × ${product?.name} (${selectedPackage.label})`);
  }

  return (
    <View className="flex-1 bg-surface">
      <StackHeader
        title="Chi tiết sản phẩm"
        rightAction={
          <View className="flex-row items-center gap-0.5">
          <IconButton
            icon={<Share2 color={colors.ink} size={20} />}
            label="Chia sẻ sản phẩm"
            size="sm"
            onPress={() => void Share.share({ message: `${product.name} – ${formatPrice(selectedPackage.price)}` })}
          />
          <View className="relative">
            <IconButton icon={<ShoppingBag color={colors.ink} size={20} />} label="Giỏ hàng" size="sm" onPress={() => Alert.alert("Giỏ hàng", "Giỏ hàng sẽ được kết nối trong bước tích hợp API.")} />
            <View pointerEvents="none" className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
              <Text className="font-vietnam text-[9px] font-bold text-on-primary">3</Text>
            </View>
          </View>
          </View>
        }
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="overflow-hidden rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest shadow-sm dark:border-[#00E676]/[0.12]">
          <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
            <Image accessibilityLabel={product.name} cachePolicy="disk" contentFit="cover" source={currentImage} style={{ width: "100%", height: "100%" }} transition={200} />
            <View className="absolute left-3 top-3 gap-2">
              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-lowest/95 px-3 py-2">
                <Leaf color={colors.secondary} fill={colors.secondary} size={15} />
                <Text className="font-vietnam text-label-md text-primary">{product.origin}</Text>
              </View>
              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-secondary px-3 py-2">
                <Clock3 color={colors.onPrimary} size={15} />
                <Text className="font-vietnam text-label-md text-on-primary">Thu hoạch sáng nay {spec.harvestTime}</Text>
              </View>
            </View>
            <View className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5">
              <Text className="font-vietnam text-label-sm text-white">{imageIndex + 1} / {spec.gallery.length}</Text>
            </View>
          </View>
          <ScrollView horizontal contentContainerStyle={{ padding: 10, gap: 8 }} showsHorizontalScrollIndicator={false}>
            {spec.gallery.map((image, index) => (
              <Pressable key={`${product.id}-gallery-${index}`} accessibilityRole="button" accessibilityLabel={`Xem ảnh ${index + 1}`} onPress={() => setImageIndex(index)} className="h-16 w-16 overflow-hidden rounded-xl border-2" style={{ borderColor: imageIndex === index ? colors.primary : "transparent" }}>
                <Image contentFit="cover" source={image} style={{ width: "100%", height: "100%" }} />
              </Pressable>
            ))}
            <View className="h-16 w-16 items-center justify-center rounded-xl bg-surface-container-low">
              <Activity color={colors.primary} size={22} />
            </View>
          </ScrollView>
        </View>

        <DetailCard>
          <View className="mb-3 flex-row flex-wrap items-center gap-2">
            <View className="rounded-lg bg-secondary-container px-2.5 py-1"><Text className="font-vietnam text-label-sm text-on-secondary-container">LOẠI 1 SIÊU TƯƠI</Text></View>
            <View className="flex-row items-center gap-1"><BadgeCheck color={colors.primary} size={16} /><Text className="font-vietnam text-label-sm text-tertiary">Chính ngạch Organic</Text></View>
          </View>
          <Text className="font-vietnam text-headline-sm text-ink">{product.id === "kale" ? "Cải Kale Thủy Canh Đà Lạt (Loại 1 Siêu Tươi)" : product.name}</Text>
          <View className="mt-3 flex-row flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <Text className="font-vietnam text-headline-lg-mobile text-primary">{formatPrice(selectedPackage.price)}</Text>
            {selectedPackage.oldPrice ? <Text className="font-vietnam text-body-md text-muted line-through">{formatPrice(selectedPackage.oldPrice)}</Text> : product.oldPrice && packageIndex === 0 ? <Text className="font-vietnam text-body-md text-muted line-through">{formatPrice(product.oldPrice)}</Text> : null}
            {discount > 0 ? <Text className="rounded bg-danger-container px-2 py-1 font-vietnam text-label-sm text-on-danger-container">-{discount}%</Text> : null}
          </View>
          <View className="mt-4 flex-row flex-wrap items-center justify-between gap-y-2 border-t border-border pt-3">
            <View className="flex-row items-center gap-1"><Star color="#F59E0B" fill="#F59E0B" size={16} /><Text className="font-vietnam text-label-md text-ink">{product.rating ?? "4.9"}</Text><Text className="font-vietnam text-body-sm text-muted">({product.reviewCount ?? 156} đánh giá)</Text></View>
            <Text className="font-vietnam text-label-md text-muted">Đã bán 1.2k+</Text>
            <View className="flex-row items-center gap-1"><Package color={colors.secondary} size={15} /><Text className="font-vietnam text-label-sm text-secondary">{selectedPackage.label}</Text></View>
          </View>
        </DetailCard>

        <DetailCard>
          <View className="mb-3 flex-row items-center justify-between gap-2">
            <View className="flex-1 flex-row items-center gap-2"><ShieldCheck color={colors.primary} size={20} /><Text className="font-vietnam text-title-md text-ink">Cam kết canh tác tử tế</Text></View>
            <Text className="font-vietnam text-label-sm uppercase text-secondary">Chuẩn 3 không</Text>
          </View>
          {[
            { Icon: AlarmClock, title: "Thu hoạch tươi mỗi sáng", note: "Đóng gói nhanh để giữ độ giòn và hương vị tự nhiên." },
            { Icon: Leaf, title: "Canh tác theo tiêu chuẩn hữu cơ", note: "Ưu tiên phương pháp canh tác an toàn và bền vững." },
            { Icon: RefreshCw, title: "Đổi trả miễn phí trong 4 giờ", note: "Liên hệ hỗ trợ nếu sản phẩm không đạt chất lượng cam kết." },
          ].map(({ Icon, title, note }) => (
            <View key={title} className="mb-2.5 flex-row items-start gap-3 rounded-xl bg-surface-container-low p-3 last:mb-0">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container"><Icon color={colors.secondary} size={20} /></View>
              <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{title}</Text><Text className="mt-1 font-vietnam text-body-md text-muted">{note}</Text></View>
            </View>
          ))}
        </DetailCard>

        <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface-container-lowest"><QrCode color={colors.primary} size={34} /></View>
          <View className="min-w-0 flex-1"><Text className="font-vietnam text-label-sm uppercase text-secondary">Minh bạch nguồn gốc</Text><Text className="mt-1 font-vietnam text-body-emphasis text-ink">Lô hái #KL-2408</Text><Text className="font-vietnam text-body-sm text-muted">{spec.location} · {spec.harvestTime}</Text></View>
          <PrimaryBtn title="Xem ký sự" variant="secondary" className="min-h-10 px-3 py-2" labelClassName="text-label-sm" trailingIcon={<ArrowRight color={colors.primary} size={15} />} onPress={() => Alert.alert("Nhật ký nông trại", "Thông tin nhật ký sẽ được cập nhật cùng dữ liệu sản phẩm.")} />
        </View>

        <DetailCard>
          <View className="mb-3 flex-row items-center justify-between gap-2"><Text className="flex-1 font-vietnam text-body-emphasis text-ink">Khối lượng đóng gói</Text><Text className="font-vietnam text-label-sm text-primary">{selectedPackage.label} · {selectedPackage.note}</Text></View>
          <View className="flex-row gap-2">
            {spec.packages.map((option, index) => {
              const selected = packageIndex === index;
              return (
                <Pressable key={option.label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setPackageIndex(index)} className="min-h-[68px] flex-1 items-center justify-center rounded-xl border px-1 py-2" style={{ backgroundColor: selected ? colors.primary : colors.surfaceRaised, borderColor: selected ? colors.primary : colors.border }}>
                  <Text className="font-vietnam text-body-emphasis" style={{ color: selected ? colors.onPrimary : colors.ink }}>{option.label}</Text>
                  <Text className="mt-1 font-vietnam text-body-sm" style={{ color: selected ? colors.onPrimary : colors.muted }}>{formatPrice(option.price)}</Text>
                </Pressable>
              );
            })}
          </View>
          <View className="mt-4 flex-row items-center justify-between"><Text className="font-vietnam text-body-emphasis text-ink">Chọn số lượng</Text><StepperBtn label="Số lượng sản phẩm" value={quantity} min={1} onValueChange={setQuantity} /></View>
        </DetailCard>

        <DetailCard>
          <View className="mb-3 flex-row items-center gap-2"><Activity color={colors.secondary} size={22} /><Text className="font-vietnam text-title-md text-ink">Thành phần dinh dưỡng nổi bật</Text></View>
          <View className="flex-row gap-2.5">
            {spec.nutrition.map((item) => <View key={item.title} className="min-w-0 flex-1 rounded-xl bg-surface-container-low p-3"><Text className="font-vietnam text-headline-sm text-primary">{item.value}</Text><Text className="mt-1 font-vietnam text-body-emphasis text-ink">{item.title}</Text><Text className="mt-1 font-vietnam text-body-sm text-muted">{item.note}</Text></View>)}
          </View>
          <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-secondary-container/40 p-3"><Award color={colors.secondary} size={20} /><Text className="flex-1 font-vietnam text-body-md text-ink">{spec.highlight}</Text></View>
          <View className="mt-4"><View className="mb-2 flex-row items-center gap-2"><Utensils color={colors.primary} size={18} /><Text className="font-vietnam text-body-emphasis text-ink">Gợi ý chế biến nhanh</Text></View><View className="flex-row gap-2">{["Sinh tố", "Salad tươi", "Món xào"].map((label, index) => <View key={label} className="flex-1 items-center rounded-xl bg-surface-container-low p-3"><View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest"><Text className="font-vietnam text-title-md text-secondary">{["◉", "✿", "⌁"][index]}</Text></View><Text className="text-center font-vietnam text-label-sm text-ink">{label}</Text></View>)}</View></View>
        </DetailCard>

        <DetailCard>
          <View className="mb-3 flex-row items-center gap-2"><MapPin color={colors.primary} size={21} /><Text className="font-vietnam text-title-md text-ink">Vùng trồng & xuất xứ</Text></View>
          <View className="flex-row items-center gap-3"><View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary-container"><Leaf color={colors.primary} size={23} /></View><View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{spec.farmName}</Text><Text className="font-vietnam text-body-md text-muted">{spec.location}</Text></View></View>
          <View className="relative mt-3 h-32 overflow-hidden rounded-xl bg-surface-container-low"><Image accessibilityLabel={`Vùng trồng ${spec.location}`} contentFit="cover" source="https://lh3.googleusercontent.com/aida-public/AB6AXuBfJ0MOy9CiuHFVFVd6CXouohaphR4djLSFb99NK36YBQRktB8m2pewAaywCeDCyPO2KeDrAA-YOkgh6yMUoRizAsbzN4A9ZmjPW44aRmzkSXUTn3io_DiSESObha-yuObno--Kp85foHdRqFbIEQjHQjJDbf9BKX2dHEm8YHVuafyhVjFk4EbmW4H8_BrdyWe5tKCGCMmw0m5I7Xxm-k6d7KRpJtcAJmnbTOVcKL0" style={{ width: "100%", height: "100%" }} /><View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-lg bg-surface-container-lowest/95 px-2.5 py-1.5"><MapPin color={colors.primary} size={14} /><Text className="font-vietnam text-label-sm text-ink">Nhà màng công nghệ cao</Text></View></View>
          <Text className="mt-3 font-vietnam text-body-md text-muted">Sản phẩm được chăm sóc tại vùng trồng đối tác, thu hoạch theo mùa và kiểm tra trước khi đóng gói.</Text>
        </DetailCard>

        <DetailCard>
          <View className="mb-3 flex-row items-center justify-between"><Text className="font-vietnam text-title-md text-ink">Đánh giá từ khách hàng</Text><View className="flex-row items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1"><Star color={colors.secondary} fill={colors.secondary} size={14} /><Text className="font-vietnam text-label-sm text-on-secondary-container">{product.rating ?? "4.9"}</Text></View></View>
          {[
            { initials: "MH", name: "Minh Hằng (Q.7, TP.HCM)", date: "Hôm qua", text: "Rau giao đến còn đọng sương, lá tươi và giòn. Đóng gói cẩn thận, mình sẽ đặt lại mỗi tuần!" },
            { initials: "VT", name: "Văn Tuấn (Bình Thạnh)", date: "3 ngày trước", text: "Nguồn gốc rõ ràng, sản phẩm đúng mô tả. Trải nghiệm mua hàng rất yên tâm." },
          ].map((review) => <View key={review.initials} className="mb-2.5 rounded-xl bg-surface-container-low p-3 last:mb-0"><View className="flex-row items-center gap-2"><View className="h-9 w-9 items-center justify-center rounded-full bg-secondary-container"><Text className="font-vietnam text-label-sm text-on-secondary-container">{review.initials}</Text></View><View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{review.name}</Text><View className="mt-0.5 flex-row">{Array.from({ length: 5 }, (_, i) => <Star key={i} color="#F59E0B" fill="#F59E0B" size={12} />)}</View></View><Text className="font-vietnam text-body-sm text-muted">{review.date}</Text></View><Text className="mt-2 font-vietnam text-body-md text-ink">{review.text}</Text></View>)}
        </DetailCard>
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-border bg-surface-container-lowest px-4 py-3 dark:border-primary/20">
        <Pressable accessibilityRole="button" accessibilityLabel="Tư vấn sản phẩm" onPress={() => Alert.alert("Tư vấn sản phẩm", "Đội ngũ Organic Việt Nam sẽ sớm hỗ trợ bạn.")} className="h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface-container-low"><MessageCircle color={colors.primary} size={20} /></Pressable>
        <PrimaryBtn title="Thêm vào giỏ" variant="secondary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Plus color={colors.primary} size={18} />} labelClassName="text-label-md" onPress={confirmAddToCart} />
        <PrimaryBtn title="Mua ngay" variant="primary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Zap color={colors.onPrimary} size={18} />} labelClassName="text-label-md" onPress={() => Alert.alert("Mua ngay", "Đơn hàng sẽ được tạo khi tích hợp thanh toán.")} />
      </View>
    </View>
  );
}
