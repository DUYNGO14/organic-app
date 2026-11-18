import { PrimaryBtn } from "@/components/common";
import { Text, View } from "react-native";

type HomeSectionHeadingProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function HomeSectionHeading({
  title,
  eyebrow,
  subtitle,
  actionLabel,
  onActionPress,
}: HomeSectionHeadingProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between gap-2 px-4">
      <View className="min-w-0 flex-1">
        {eyebrow ? (
          <Text className="mb-1 font-vietnam text-label-sm font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text className="font-vietnam text-headline-sm text-ink">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 font-vietnam text-body-sm text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <PrimaryBtn
          title={actionLabel}
          variant="ghost"
          className="mb-1 min-h-0 px-1 py-1"
          labelClassName="text-label-md"
          onPress={onActionPress}
        />
      ) : null}
    </View>
  );
}
