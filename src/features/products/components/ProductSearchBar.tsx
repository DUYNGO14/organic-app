import { useTranslation } from "react-i18next";
import { IconButton, SearchInput } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { Mic, QrCode, Search } from "lucide-react-native";
import { View } from "react-native";

type ProductSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onScanPress: () => void;
  onSubmitSearch?: (query: string) => void;
};

export function ProductSearchBar({
  value,
  onChangeText,
  onScanPress,
  onSubmitSearch,
}: ProductSearchBarProps) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View className="bg-canvas px-4 pb-2 pt-3">
      <SearchInput
        accessibilityLabel={t("products.searchProduce")}
        autoCapitalize="none"
        containerClassName="min-w-0"
        inputClassName="text-body-md"
        inputWrapperClassName="rounded-xl border-border bg-surface-container-lowest px-3"
        leadingIcon={<Search color={colors.primary} size={21} />}
        onChangeText={onChangeText}
        onClear={() => onChangeText("")}
        onSubmitEditing={(event) => onSubmitSearch?.(event.nativeEvent.text)}
        placeholder={t("products.searchOrganicVegetablesAndFruit")}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        trailingAccessory={
          <View className="flex-row items-center">
            <IconButton
              disabled
              label={t("products.searchByVoice")}
              size="lg"
              icon={<Mic color={colors.muted} size={20} />}
            />
            <IconButton
              label={t("products.scanQrCode")}
              size="lg"
              icon={<QrCode color={colors.primary} size={20} />}
              onPress={onScanPress}
            />
          </View>
        }
        value={value}
      />
    </View>
  );
}
