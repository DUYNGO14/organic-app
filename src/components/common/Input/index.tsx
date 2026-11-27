import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Search, X } from "lucide-react-native";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type FieldFrameProps = {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
};

export function FieldFrame({ label, required, error, helperText, children, className = "" }: FieldFrameProps) {
  return (
    <View className={`gap-2 ${className}`}>
      {label ? (
        <Text className="font-vietnam text-label-md text-ink">
          {label}
          {required ? <Text className="text-danger"> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="font-vietnam text-body-sm text-muted">{helperText}</Text>
      ) : null}
    </View>
  );
}

type BaseInputProps = Omit<TextInputProps, "className"> & {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
};

type SwappableInputProps = BaseInputProps & {
  inputComponent?: ComponentType<TextInputProps>;
};

type InputControlProps = TextInputProps & {
  inputComponent?: ComponentType<TextInputProps>;
};

function InputControl({ inputComponent: Control = TextInput, className, ...props }: InputControlProps) {
  const colors = useAppColors();
  return (
    <Control
      placeholderTextColor={colors.muted}
      className={twMerge("font-vietnam text-body-md text-ink", className)}
      {...props}
    />
  );
}

export function Input({
  label,
  required,
  error,
  helperText,
  containerClassName,
  inputClassName,
  inputComponent,
  ...props
}: SwappableInputProps) {
  return (
    <FieldFrame label={label} required={required} error={error} helperText={helperText} className={containerClassName}>
      <InputControl
        inputComponent={inputComponent}
        accessibilityLabel={label}
        className={twMerge(
          "min-h-12 rounded border bg-surface px-4 py-3",
          error ? "border-danger" : "border-border-strong focus:border-primary",
          inputClassName,
        )}
        {...props}
      />
    </FieldFrame>
  );
}

export const TextField = Input;

type InputVariant = "default" | "inset";

export type PhoneInputProps = SwappableInputProps & {
  countryCode?: string;
  variant?: InputVariant;
};

export function PhoneInput({ countryCode = "+84", variant = "default", ...props }: PhoneInputProps) {
  const { t } = useTranslation();
  const {
    label,
    required,
    error,
    helperText,
    containerClassName,
    inputClassName,
    accessibilityLabel,
    inputComponent,
    onBlur,
    onFocus,
    ...inputProps
  } = props;
  const [focused, setFocused] = useState(false);
  const inset = variant === "inset";

  return (
    <FieldFrame
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <View className={twMerge(
        "flex-row items-center rounded-lg border",
        inset ? "min-h-14 bg-surface-container-low/90" : "h-12 bg-surface",
        error ? "border-danger" : focused && inset ? "border-primary" : "border-border-strong",
      )}>
        <Text className={inset
          ? "border-r border-border-strong px-4 font-vietnam text-label-lg text-primary"
          : "pl-4 font-vietnam text-body-md text-muted"}>
          {countryCode}
        </Text>
        <InputControl
          inputComponent={inputComponent}
          accessibilityLabel={accessibilityLabel ?? label ?? t("common.phoneNumber")}
          autoComplete="tel"
          keyboardType="phone-pad"
          placeholder="912 345 678"
          textContentType="telephoneNumber"
          {...inputProps}
          className={twMerge("min-w-0 flex-1 px-3", inset ? "min-h-14 py-3" : "h-full", inputClassName)}
          onBlur={(event) => {
            if (inset) setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            if (inset) setFocused(true);
            onFocus?.(event);
          }}
        />
      </View>
    </FieldFrame>
  );
}

export type PasswordInputProps = BaseInputProps & {
  leadingIcon?: ReactNode;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function PasswordInput({
  leadingIcon,
  showPasswordLabel,
  hidePasswordLabel,
  label,
  required,
  error,
  helperText,
  containerClassName,
  inputClassName = "",
  accessibilityLabel,
  onBlur,
  onFocus,
  ...inputProps
}: PasswordInputProps) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <FieldFrame label={label} required={required} error={error} helperText={helperText} className={containerClassName}>
      <View className={twMerge(
        "min-h-12 flex-row items-center rounded border border-border-strong bg-surface",
        focused && "border-primary",
        error && "border-danger",
      )}>
        {leadingIcon ? <View className="pl-4" aria-hidden>{leadingIcon}</View> : null}
        <InputControl
          accessibilityLabel={accessibilityLabel ?? label ?? t("common.password")}
          autoCapitalize="none"
          autoComplete="current-password"
          placeholder={t("common.enterYourPassword")}
          {...inputProps}
          className={twMerge("min-h-12 min-w-0 flex-1 px-4 py-3", leadingIcon && "pl-3", inputClassName)}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          secureTextEntry={!visible}
        />
        <Pressable
          accessibilityLabel={visible ? hidePasswordLabel ?? t("common.hidePassword") : showPasswordLabel ?? t("common.showPassword")}
          accessibilityRole="button"
          className="min-h-12 min-w-12 items-center justify-center"
          onPress={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff color={colors.muted} size={20} /> : <Eye color={colors.muted} size={20} />}
        </Pressable>
      </View>
    </FieldFrame>
  );
}

export type SearchInputProps = SwappableInputProps & {
  onClear?: () => void;
  leadingIcon?: ReactNode;
  trailingAccessory?: ReactNode;
  inputWrapperClassName?: string;
};

export function SearchInput({
  onClear,
  leadingIcon,
  trailingAccessory,
  value,
  label,
  required,
  inputComponent,
  error,
  helperText,
  containerClassName,
  inputWrapperClassName = "",
  accessibilityLabel,
  inputClassName = "",
  ...inputProps
}: SearchInputProps) {
  const { t } = useTranslation();
  const colors = useAppColors();
  return (
    <FieldFrame label={label} required={required} error={error} helperText={helperText} className={containerClassName}>
      <View
        className={twMerge(
          "h-12 flex-row items-center rounded-full border border-border-strong bg-surface px-4 focus-within:border-primary",
          inputWrapperClassName,
        )}
      >
        {leadingIcon ?? <Search color={colors.muted} size={19} />}
        <InputControl
          inputComponent={inputComponent}
          accessibilityLabel={accessibilityLabel ?? label ?? t("common.search")}
          autoCapitalize="none"
          clearButtonMode="never"
          placeholder={t("common.searchProducts")}
          returnKeyType="search"
          {...inputProps}
          className={`h-full min-w-0 flex-1 px-3 ${inputClassName}`}
          value={value}
        />
        {Boolean(value) && onClear ? (
          <Pressable
            accessibilityLabel={t("common.clearSearch")}
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center"
            hitSlop={8}
            onPress={onClear}
          >
            <X color={colors.muted} size={18} />
          </Pressable>
        ) : null}
        {trailingAccessory}
      </View>
    </FieldFrame>
  );
}

export type OTPInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  label?: string;
  required?: boolean;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: InputVariant;
  className?: string;
};

export function OTPInput({
  value,
  onChangeText,
  length = 6,
  label: suppliedLabel,
  required,
  error,
  autoFocus = false,
  disabled = false,
  variant = "default",
  className = "",
}: OTPInputProps) {
  const { t } = useTranslation();
  const label = suppliedLabel ?? t("common.verificationCode");
  const digits = value.replace(/\D/g, "").slice(0, length);
  const inset = variant === "inset";

  return (
    <FieldFrame label={label} required={required} error={error} className={className}>
      <View className="relative flex-row justify-between gap-2">
        {Array.from({ length }, (_, index) => {
          const digit = digits[index] ?? "";
          const isActive = index === digits.length;
          return (
            <View
              key={index}
              className={twMerge(
                "min-w-0 flex-1 items-center justify-center rounded-lg border",
                inset ? "min-h-14 bg-surface-container-low/90" : "h-14 bg-surface",
                error ? "border-danger" : isActive ? "border-primary" : "border-border-strong",
                !error && inset && isActive && "bg-primary/10",
              )}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {inset && !digit ? (
                <View className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted/40"}`} />
              ) : (
                <Text className="font-vietnam text-headline-sm text-ink">
                  {digit}
                </Text>
              )}
            </View>
          );
        })}
        <TextInput
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          caretHidden
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, "").slice(0, length))}
          selection={{ start: digits.length, end: digits.length }}
          selectionColor="transparent"
          style={{ position: "absolute", inset: 0, opacity: 0 }}
          underlineColorAndroid="transparent"
          value={digits}
        />
      </View>
    </FieldFrame>
  );
}
