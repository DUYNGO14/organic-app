import { IconButton, PrimaryBtn } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlarmClock, ArrowRight, Ban, BookOpen, Droplet, Flower2, Leaf, Map, MapPin,
  Maximize, ShieldCheck, Sprout, Sun, Thermometer, Trees, Wind,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { certificates, commitments, featuredStory, forecast, greenhouse, regions, stories, type FarmDetail, type FarmStory } from "./farm.data";

type FarmSectionProps = { onOpen: (detail: FarmDetail) => void };

const climate = [
  { Icon: Thermometer, value: "18,5°C", label: "Nhiệt độ" },
  { Icon: Droplet, value: "78%", label: "Độ ẩm đất" },
  { Icon: Sun, value: "2,1 UV", label: "Nắng nhẹ" },
  { Icon: Wind, value: "Gió nhẹ", label: "Sức gió" },
];
const regionIcons = [Leaf, Sprout, Flower2, Trees];

export function FarmOverview({ onOpen }: FarmSectionProps) {
  const colors = useAppColors();

  return (
    <View className="overflow-hidden rounded-lg border border-card-border bg-surface">
      <View className="aspect-[8/5] min-h-52 justify-between p-3">
        <Image source={greenhouse.image} contentFit="cover" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["transparent", colors.photoScrim]}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row flex-wrap gap-2 py-1">
            <Text className="rounded-full bg-primary px-3 py-1 font-vietnam text-label-md text-on-primary">
              Ảnh nhà màng
            </Text>
            <Text className="rounded-full bg-surface px-3 py-1 font-vietnam text-label-md text-primary">
              CAM 02 · Nhà màng A3
            </Text>
          </View>
          <IconButton
            icon={<Maximize color={colors.onPhoto} size={20} />}
            label="Xem ảnh nhà màng toàn màn hình"
            size="lg"
            className="bg-photo-scrim/70"
            onPress={() => onOpen(greenhouse)}
          />
        </View>
        <View className="gap-1">
          <View className="flex-row items-center gap-1.5">
            <MapPin color={colors.onPhoto} size={16} />
            <Text className="flex-1 font-vietnam text-label-md text-on-photo">Cao nguyên Lạc Dương, Lâm Đồng</Text>
          </View>
          <Text className="font-vietnam text-headline-sm text-on-photo">Thu hoạch xà lách thủy canh sương mai</Text>
        </View>
      </View>
      <View className="gap-2 p-3">
        <View className="flex-row">
          {climate.map(({ Icon, value, label }, index) => (
            <View key={label} className={`min-w-0 flex-1 items-center gap-1 px-1 ${index ? "border-l border-border" : ""}`}>
              <View className="flex-row flex-wrap items-center justify-center gap-1">
                <Icon color={colors.primary} size={15} />
                <Text className="text-center font-vietnam text-label-lg text-primary">{value}</Text>
              </View>
              <Text className="text-center font-vietnam text-label-sm text-muted">{label}</Text>
            </View>
          ))}
        </View>
        <Text className="text-center font-vietnam text-label-sm text-muted">Chỉ số vi khí hậu minh họa</Text>
      </View>
    </View>
  );
}

export function FarmJournal({ onOpen }: { onOpen: (story: FarmStory) => void }) {
  const colors = useAppColors();
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text accessibilityRole="header" className="font-vietnam text-headline-md text-ink">Nhịp đập mùa vụ & ký sự</Text>
          <Text className="font-vietnam text-body-md text-muted">Tin thu hoạch và kỹ thuật chăm bón sinh học</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          <BookOpen color={colors.primary} size={21} />
        </View>
      </View>
      <View className="overflow-hidden rounded-lg border border-card-border bg-surface">
        <View className="aspect-[2/1] bg-surface-container p-3">
          <Image source={featuredStory.image} contentFit="cover" style={StyleSheet.absoluteFill} />
          <Text className="self-start rounded-full bg-primary px-3 py-1 font-vietnam text-label-md uppercase text-on-primary">
            {featuredStory.label}
          </Text>
        </View>
        <View className="gap-2 p-4">
          <Text className="font-vietnam text-label-md text-muted">Bởi {featuredStory.author} · {featuredStory.location}</Text>
          <Text className="font-vietnam text-headline-sm text-ink">{featuredStory.title}</Text>
          <Text numberOfLines={2} className="font-vietnam text-body-md text-muted">{featuredStory.description}</Text>
          <View className="flex-row flex-wrap items-center justify-between gap-x-2 border-t border-border pt-1">
            <View className="flex-row items-center gap-1">
              <Leaf color={colors.primary} size={16} />
              <Text className="font-vietnam text-label-md text-primary">Độ ngọt 12,8°Bx</Text>
            </View>
            <PrimaryBtn title="Xem ký sự" variant="ghost" className="px-1" onPress={() => onOpen(featuredStory)}
              trailingIcon={<ArrowRight color={colors.primary} size={16} />} />
          </View>
        </View>
      </View>
      {stories.map((story) => (
        <Pressable
          key={story.title}
          accessibilityRole="button"
          onPress={() => onOpen(story)}
          className="min-h-12 flex-row items-center gap-3 rounded-lg border border-card-border bg-surface p-3 active:bg-surface-soft"
        >
          <View className="h-20 w-20 overflow-hidden rounded-md bg-surface-container">
            <Image source={story.image} contentFit="cover" style={StyleSheet.absoluteFill} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            {story.tags?.length ? (
              <Text className="font-vietnam text-label-md text-primary">{story.tags.join("  ")}</Text>
            ) : null}
            <Text className="font-vietnam text-body-emphasis text-ink">{story.title}</Text>
            <Text className="font-vietnam text-label-sm text-muted">{story.author}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function FarmRegions({ onOpen }: FarmSectionProps) {
  const colors = useAppColors();
  return (
    <View className="gap-4 rounded-lg bg-surface-soft p-4">
      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-vietnam text-label-md uppercase text-primary">Vùng nguyên liệu</Text>
          <Text accessibilityRole="header" className="font-vietnam text-headline-md text-ink">Bản đồ nông trại & lịch thu hoạch</Text>
        </View>
        <Map color={colors.primary} size={25} />
      </View>
      {[regions.slice(0, 2), regions.slice(2)].map((row, rowIndex) => (
        <View key={row[0].title} className="flex-row gap-2">
          {row.map((region, index) => {
            const Icon = regionIcons[rowIndex * 2 + index];
            return (
              <Pressable
                key={region.title}
                accessibilityRole="button"
                className="min-h-12 min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border border-card-border bg-surface p-2 active:bg-surface-container"
                onPress={() => onOpen({ ...region, description: region.harvest })}
              >
                <View className="h-7 w-7 items-center justify-center rounded bg-primary-container">
                  <Icon color={colors.ink} size={15} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-vietnam text-body-emphasis text-ink">{region.title}</Text>
                  <Text className="font-vietnam text-label-sm text-muted">{region.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View className="gap-2 rounded-lg bg-primary p-3">
        <View className="flex-row items-center gap-1.5">
          <AlarmClock color={colors.onPrimary} size={17} />
          <Text className="font-vietnam text-label-md uppercase text-on-primary">Dự báo đợt hái</Text>
        </View>
        <Text className="font-vietnam text-body-emphasis text-on-primary">Dâu tây Hana và cà chua bi</Text>
        <PrimaryBtn title="Xem đợt hái" variant="secondary" onPress={() => onOpen(forecast)} />
      </View>
    </View>
  );
}

export function FarmCommitments({ onOpen }: FarmSectionProps) {
  const colors = useAppColors();
  return (
    <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          <ShieldCheck color={colors.primary} size={23} />
        </View>
        <Text accessibilityRole="header" className="min-w-0 flex-1 font-vietnam text-headline-sm text-ink">
          Cam kết nông trại xanh 3 không
        </Text>
      </View>
      {commitments.map(({ title, description }) => (
        <View key={title} className="flex-row items-start gap-2 rounded-lg bg-surface-soft p-3">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-danger-container">
            <Ban color={colors.danger} size={16} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="font-vietnam text-body-emphasis text-ink">{title}</Text>
            <Text className="font-vietnam text-body-sm text-muted">{description}</Text>
          </View>
        </View>
      ))}
      <PrimaryBtn title="Xem thông tin chứng nhận" variant="ghost" fullWidth onPress={() => onOpen(certificates)}
        trailingIcon={<ArrowRight color={colors.primary} size={16} />} />
    </View>
  );
}
