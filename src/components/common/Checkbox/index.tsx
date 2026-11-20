import { Check, Minus } from "lucide-react-native";
import { Pressable, Text, View, type PressableProps } from "react-native";

export type CheckboxProps = Omit<PressableProps, "children" | "onPress"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  indeterminate?: boolean;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  indeterminate = false,
  disabled = false,
  className = "",
  ...props
}: CheckboxProps) {
  const selected = checked || indeterminate;

  return (
    <Pressable
      accessibilityLabel={label ?? "Ô chọn"}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
      className={`min-h-11 flex-row items-center gap-3 ${disabled ? "opacity-50" : ""} ${className}`}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      {...props}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${selected ? "border-secondary bg-secondary dark:border-primary dark:bg-primary" : "border-border-strong bg-surface"}`}
      >
        {indeterminate ? (
          <Minus color="#ffffff" size={15} strokeWidth={3} />
        ) : checked ? (
          <Check color="#ffffff" size={15} strokeWidth={3} />
        ) : null}
      </View>
      {label || description ? (
        <View className="flex-1">
          {label ? <Text className="font-vietnam text-body-md text-ink">{label}</Text> : null}
          {description ? (
            <Text className="mt-0.5 font-vietnam text-body-sm text-muted">{description}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
