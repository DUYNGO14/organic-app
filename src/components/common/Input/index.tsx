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
          error ? "border-danger" : "border-border-strong",
          inputClassName,
        )}
        {...props}
      />
    </FieldFrame>
  );
}

export const TextField = Input;

export type PhoneInputProps = SwappableInputProps & {
  countryCode?: string;
};

export function PhoneInput({ countryCode = "+84", ...props }: PhoneInputProps) {
  const {
    label,
    required,
    error,
    helperText,
    containerClassName,
    inputClassName,
    accessibilityLabel,
    inputComponent,
    ...inputProps
  } = props;

  return (
    <FieldFrame
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <View className={`h-12 flex-row items-center rounded-lg border bg-surface ${error ? "border-danger" : "border-border-strong"}`}>
        <Text className="pl-4 font-vietnam text-body-md text-muted">{countryCode}</Text>
        <InputControl
          inputComponent={inputComponent}
          accessibilityLabel={accessibilityLabel ?? label ?? "Số điện thoại"}
          autoComplete="tel"
          keyboardType="phone-pad"
          placeholder="912 345 678"
          textContentType="telephoneNumber"
          {...inputProps}
          className={`h-full min-w-0 flex-1 px-3 ${inputClassName ?? ""}`}
        />
      </View>
    </FieldFrame>
  );
}

export type PasswordInputProps = BaseInputProps & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function PasswordInput({
  showPasswordLabel = "Hiện mật khẩu",
  hidePasswordLabel = "Ẩn mật khẩu",
  label,
  required,
  error,
  helperText,
  containerClassName,
  inputClassName = "",
  accessibilityLabel,
  ...inputProps
}: PasswordInputProps) {
  const colors = useAppColors();
  const [visible, setVisible] = useState(false);

  return (
    <FieldFrame label={label} required={required} error={error} helperText={helperText} className={containerClassName}>
      <View className={`h-12 flex-row items-center rounded-lg border bg-surface focus-within:border-primary ${error ? "border-danger" : "border-border-strong"}`}>
        <InputControl
          accessibilityLabel={accessibilityLabel ?? label ?? "Mật khẩu"}
          autoCapitalize="none"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          {...inputProps}
          className={`h-full min-w-0 flex-1 px-4 ${inputClassName}`}
          secureTextEntry={!visible}
        />
        <Pressable
          accessibilityLabel={visible ? hidePasswordLabel : showPasswordLabel}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center"
          hitSlop={8}
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
          accessibilityLabel={accessibilityLabel ?? label ?? "Tìm kiếm"}
          autoCapitalize="none"
          clearButtonMode="never"
          placeholder="Tìm sản phẩm..."
          returnKeyType="search"
          {...inputProps}
          className={`h-full min-w-0 flex-1 px-3 ${inputClassName}`}
          value={value}
        />
        {Boolean(value) && onClear ? (
          <Pressable
            accessibilityLabel="Xóa nội dung tìm kiếm"
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
  className?: string;
};

export function OTPInput({
  value,
  onChangeText,
  length = 6,
  label = "Mã xác thực",
  required,
  error,
  autoFocus = false,
  disabled = false,
  className = "",
}: OTPInputProps) {
  const digits = value.replace(/\D/g, "").slice(0, length);

  return (
    <FieldFrame label={label} required={required} error={error} className={className}>
      <View className="relative flex-row justify-between gap-2">
        {Array.from({ length }, (_, index) => {
          const digit = digits[index] ?? "";
          const isActive = index === digits.length;
          return (
            <View
              key={index}
              className={`h-14 min-w-0 flex-1 items-center justify-center rounded-lg border bg-surface ${error ? "border-danger" : isActive ? "border-primary" : "border-border-strong"}`}
            >
              <Text className="font-vietnam text-headline-sm text-ink">
                {digit}
              </Text>
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
          selectTextOnFocus
          style={{ position: "absolute", inset: 0, opacity: 0 }}
          value={digits}
        />
      </View>
    </FieldFrame>
  );
}
