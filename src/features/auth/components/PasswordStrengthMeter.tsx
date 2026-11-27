import { useTranslation } from "react-i18next";
import { assessPassword, MIN_STRONG_PASSWORD_LENGTH } from "@/features/auth/password-strength";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { Circle, CircleCheck } from "lucide-react-native";
import { Text, View } from "react-native";

const strengthLevels = {
  empty: { label: "auth.empty", filled: 0, bar: "bg-border", text: "text-muted", hint: null },
  weak: {
    label: "auth.weak",
    filled: 1,
    bar: "bg-danger",
    text: "text-danger",
    hint: "auth.useALongerPasswordAndAvoid",
  },
  medium: {
    label: "auth.medium",
    filled: 2,
    bar: "bg-warning",
    text: "text-warning",
    hint: "auth.tryAddingMoreCharactersNumbersOr",
  },
  strong: {
    label: "auth.strong",
    filled: 3,
    bar: "bg-primary",
    text: "text-primary",
    hint: null,
  },
} as const;

const characterGroupLabels = [
  ["lowercase", "auth.lowercaseLetters"],
  ["uppercase", "auth.uppercaseLetters"],
  ["digit", "auth.digits"],
  ["symbol", "auth.symbols"],
] as const;

export function PasswordStrengthMeter({
  password,
  variant = "inline",
}: {
  password: string;
  variant?: "inline" | "panel";
}) {
  const { t } = useTranslation();
  const { primary, muted } = useAppColors();
  const panel = variant === "panel";
  if (!password && !panel) return null;
  const {
    level,
    characterGroups,
    requiredGroups,
    meetsLength,
    meetsGroups,
    avoidsPredictablePattern,
  } = assessPassword(password);
  const { label: labelKey, filled, bar, text, hint } = strengthLevels[level];
  const label = t(labelKey);
  const segmentCount = panel ? 4 : 3;
  const filledSegments = level === "strong" ? segmentCount : filled;
  const presentGroups = characterGroupLabels
    .filter(([group]) => characterGroups[group])
    .map(([, label]) => t(label));
  const groupDetail = presentGroups.length
    ? t("auth.included", { value: presentGroups.join(", ") })
    : t("auth.chooseFromLowercaseLettersUppercaseLetters");

  function renderRequirement(label: string, met: boolean, detail?: string) {
    const Icon = met ? CircleCheck : Circle;
    return (
      <View
        accessible
        accessibilityLabel={[label, met ? t("auth.met") : t("auth.notMet"), detail].filter(Boolean).join(", ")}
        className="flex-row items-start gap-2"
      >
        <View className="pt-1" aria-hidden>
          <Icon color={met ? primary : muted} size={16} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className={cn("font-vietnam text-body-md", met ? "text-primary" : "text-muted")}>
            {label}
          </Text>
          {detail ? <Text className="font-vietnam text-body-sm text-muted">{detail}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View className={cn("gap-2", panel && "rounded-lg bg-surface-soft p-3")}>
      <View className="flex-row flex-wrap items-center justify-between gap-x-2">
        <Text className="font-vietnam text-label-md text-muted">{t("auth.passwordStrength")}</Text>
        <Text
          accessibilityLabel={t("auth.passwordStrength2", { value: label.toLowerCase() })}
          accessibilityLiveRegion="polite"
          className={`font-vietnam text-label-md ${text}`}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row gap-1" aria-hidden>
        {Array.from({ length: segmentCount }, (_, segment) => (
          <View
            key={segment}
            className={cn("h-1 flex-1 rounded-full", segment < filledSegments ? bar : "bg-border")}
          />
        ))}
      </View>
      {panel ? (
        <View className="gap-2">
          {renderRequirement(t("auth.atLeastCharacters", { minStrongPasswordLength: MIN_STRONG_PASSWORD_LENGTH }), meetsLength)}
          {renderRequirement(t("auth.atLeastCharacterGroups", { requiredGroups }), meetsGroups, groupDetail)}
          {renderRequirement(t("auth.avoidPredictablePasswordPatterns"), avoidsPredictablePattern)}
        </View>
      ) : null}
      {!panel && hint ? <Text className="font-vietnam text-body-sm text-muted">{t(hint)}</Text> : null}
    </View>
  );
}
