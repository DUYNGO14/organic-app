import { useAppColors } from "@/hooks/use-app-colors";
import { Award, BadgeCheck, RefreshCw, Timer } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const promises = [
  {
    id: "fresh",
    title: "home.pickedToday",
    note: "Giao tươi ngon",
    Icon: Timer,
  },
  {
    id: "trace",
    title: "home.fullyTraceable",
    note: "Mã QR từng lô",
    Icon: BadgeCheck,
  },
  {
    id: "return",
    title: "home.returnsAtYourDoor",
    note: "Nếu không hài lòng",
    Icon: RefreshCw,
  },
] as const;

export function QualityPromise() {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View className="mx-4 mt-8 rounded-xl bg-surface-container-low px-3 py-4">
      <View className="mb-4 flex-row items-center gap-2">
        <Award color={colors.secondary} size={18} />
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          numberOfLines={1}
          className="min-w-0 flex-1 font-vietnam text-label-lg text-primary"
        >
          {t("home.adigoQualityPromise")}
        </Text>
      </View>
      <View className="flex-row gap-1">
        {promises.map(({ id, title, note, Icon }) => (
          <View key={id} className="min-w-0 flex-1 items-center gap-1">
            <View className="mb-1 h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest">
              <Icon color={colors.primary} size={18} />
            </View>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              numberOfLines={1}
              className="self-stretch text-center font-vietnam text-label-md text-ink"
            >
              {t(title)}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              numberOfLines={1}
              className="self-stretch text-center font-vietnam text-body-sm text-muted"
            >
              {note}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
