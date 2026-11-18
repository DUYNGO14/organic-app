import { IconButton, PrimaryBtn } from "@/components/common";
import { farmStoryImage } from "@/features/home/home.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { ArrowRight, QrCode, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

type TraceabilityCardProps = {
  onJournalPress?: () => void;
};

export function TraceabilityCard({ onJournalPress }: TraceabilityCardProps) {
  const colors = useAppColors();

  return (
    <View className="mx-4 mt-8 rounded-[26px] border border-[#F0F4EC] bg-surface-container-lowest p-4 shadow-sm dark:border-[#00E676]/[0.12]">
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary-container/50">
            <ShieldCheck color={colors.primary} size={23} />
          </View>
          <Text className="flex-1 font-vietnam text-label-lg text-ink">
            Minh bạch nguồn gốc 100%
          </Text>
        </View>
        <PrimaryBtn
          title="Nhật ký số"
          variant="ghost"
          className="min-h-0 px-1 py-1"
          labelClassName="text-label-md text-secondary"
          onPress={onJournalPress}
        />
      </View>

      <View className="h-[220px] overflow-hidden rounded-2xl bg-primary">
        <Image
          accessibilityLabel="Nông trại hữu cơ tại cao nguyên"
          cachePolicy="disk"
          contentFit="cover"
          source={farmStoryImage}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          transition={200}
        />
        <View className="absolute inset-0 bg-[#00391b]/45" />
        <View className="flex-1 justify-end p-4">
          <Text className="font-vietnam text-label-sm uppercase tracking-wide text-white/80">
            Hợp tác xã nông sản sạch
          </Text>
          <Text className="mt-1 font-vietnam text-headline-sm text-white">
            Nông Trại Cao Nguyên Xanh (Lâm Đồng)
          </Text>
          <Text className="mt-1 font-vietnam text-body-md text-white/85">
            Tiêu chuẩn canh tác VietGAP 2024
          </Text>
        </View>
        <IconButton
          label="Quét mã truy xuất nông trại"
          size="lg"
          className="absolute bottom-3 right-3 rounded-xl bg-white"
          onPress={onJournalPress}
          icon={<QrCode color={colors.primary} size={25} />}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-start gap-2">
          <View className="mt-2 h-2.5 w-2.5 rounded-full bg-secondary" />
          <Text className="flex-1 font-vietnam text-body-sm text-muted">
            Lô thu hoạch gần nhất: Hôm nay, 04:30 AM
          </Text>
        </View>
        <PrimaryBtn
          title="Xem nhật ký"
          variant="ghost"
          className="min-h-0 flex-row px-1 py-1"
          labelClassName="text-label-md"
          trailingIcon={<ArrowRight color={colors.primary} size={16} />}
          onPress={onJournalPress}
        />
      </View>
    </View>
  );
}
