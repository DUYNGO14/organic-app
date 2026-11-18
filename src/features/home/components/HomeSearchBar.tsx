import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { QrCode, Search, SlidersHorizontal } from "lucide-react-native";
import { TextInput, View } from "react-native";

type HomeSearchBarProps = {
  onSearch?: (text: string) => void;
  onScanPress?: () => void;
  onFilterPress?: () => void;
};

export function HomeSearchBar({
  onSearch,
  onScanPress,
  onFilterPress,
}: HomeSearchBarProps) {
  const colors = useAppColors();

  return (
    <View className="flex-row items-center gap-3 px-4 pb-1 pt-3">
      <View className="h-12 flex-1 flex-row items-center rounded-2xl bg-surface-container-lowest px-3 shadow-sm border border-border dark:border-border-strong">
        <Search color={colors.primary} size={21} />
        <TextInput
          accessibilityLabel="Tìm nông sản"
          className="ml-2 h-full min-w-0 flex-1 font-vietnam text-body-lg text-ink"
          onChangeText={onSearch}
          onSubmitEditing={(event) => onSearch?.(event.nativeEvent.text)}
          placeholder="Rau củ tươi, quả sạch VietGAP..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
        />
        <IconButton
          label="Quét mã QR nông sản"
          size="sm"
          onPress={onScanPress}
          icon={<QrCode color={colors.primary} size={21} />}
        />
      </View>
      <IconButton
        label="Bộ lọc tìm kiếm"
        size="lg"
        variant="outlined"
        className="rounded-2xl border-0 bg-surface-container-lowest shadow-sm"
        onPress={onFilterPress}
        icon={<SlidersHorizontal color={colors.primary} size={21} />}
      />
    </View>
  );
}
