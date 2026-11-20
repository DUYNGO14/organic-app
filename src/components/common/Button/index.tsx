import { Minus, Plus } from "lucide-react-native";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  View,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

export type PrimaryBtnProps = Omit<PressableProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  labelClassName?: string;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary/85",
  secondary: "border border-primary bg-surface active:bg-surface-soft dark:border-primary/30 dark:bg-surface-container-low",
  ghost: "bg-transparent active:bg-surface-soft dark:active:bg-surface-container",
};

const labelVariants: Record<ButtonVariant, string> = {
  primary: "text-on-primary",
  secondary: "text-primary",
  ghost: "text-primary",
};

export function PrimaryBtn({
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  labelClassName = "",
  className = "",
  ...props
}: PrimaryBtnProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-5 py-3 ${buttonVariants[variant]} ${fullWidth ? "w-full" : "self-start"} ${isDisabled ? "opacity-50" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#006b35"} />
      ) : (
        <>
          {leadingIcon}
          <Text className={`font-vietnam text-label-lg ${labelVariants[variant]} ${labelClassName}`}>
            {title}
          </Text>
          {trailingIcon}
        </>
      )}
    </Pressable>
  );
}

export type IconButtonProps = Omit<PressableProps, "children"> & {
  icon: ReactNode;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "plain" | "outlined" | "filled";
};

const iconButtonSizes = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
} as const;

const iconButtonVariants = {
  plain: "bg-transparent active:bg-surface-soft dark:active:bg-surface-container",
  outlined: "border border-border bg-surface active:bg-surface-soft dark:border-border-strong dark:bg-surface-container-low",
  filled: "bg-primary active:bg-primary/85",
} as const;

export function IconButton({
  icon,
  label,
  size = "md",
  variant = "plain",
  disabled = false,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`items-center justify-center rounded-full ${iconButtonSizes[size]} ${iconButtonVariants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
      disabled={disabled}
      hitSlop={8}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

export type StepperBtnProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function StepperBtn({
  value,
  onValueChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  disabled = false,
  label = "Số lượng",
  className = "",
}: StepperBtnProps) {
  const colors = useAppColors();
  const canDecrement = !disabled && value - step >= min;
  const canIncrement = !disabled && value + step <= max;

  return (
    <View
      accessibilityLabel={label}
      className={`min-h-12 flex-row items-center rounded-full border border-border bg-surface dark:border-border-strong dark:bg-surface-container-low ${className}`}
    >
      <Pressable
        accessibilityLabel="Giảm số lượng"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canDecrement }}
        className={`h-12 w-12 items-center justify-center rounded-full ${canDecrement ? "active:bg-surface-soft dark:active:bg-surface-container-high" : "opacity-40"}`}
        disabled={!canDecrement}
        onPress={() => onValueChange(Math.max(min, value - step))}
      >
        <Minus color={canDecrement ? colors.primary : colors.muted} size={18} />
      </Pressable>
      <Text accessibilityLiveRegion="polite" className="min-w-9 px-1 text-center font-vietnam text-label-lg text-ink">
        {value}
      </Text>
      <Pressable
        accessibilityLabel="Tăng số lượng"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canIncrement }}
        className={`h-12 w-12 items-center justify-center rounded-full ${canIncrement ? "active:bg-surface-soft dark:active:bg-surface-container-high" : "opacity-40"}`}
        disabled={!canIncrement}
        onPress={() => onValueChange(Math.min(max, value + step))}
      >
        <Plus color={canIncrement ? colors.primary : colors.muted} size={18} />
      </Pressable>
    </View>
  );
}
