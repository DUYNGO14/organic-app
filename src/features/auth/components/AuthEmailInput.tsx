import { Input } from "@/components/common";
import type { ComponentProps } from "react";

type AuthEmailInputProps = Pick<ComponentProps<typeof Input>,
  "editable" | "error" | "onBlur" | "onChangeText" | "onSubmitEditing" | "returnKeyType" | "value"
>;

export function AuthEmailInput(props: AuthEmailInputProps) {
  return (
    <Input
      label="Email"
      required
      autoCapitalize="none"
      autoComplete="email"
      autoCorrect={false}
      keyboardType="email-address"
      placeholder="Nhập địa chỉ email"
      {...props}
    />
  );
}
