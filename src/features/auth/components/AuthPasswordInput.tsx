import { PasswordInput, type PasswordInputProps } from "@/components/common";
import { View } from "react-native";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export function AuthPasswordInput({
  newPassword,
  ...props
}: PasswordInputProps & { newPassword: boolean }) {
  return (
    <View className="gap-2">
      <PasswordInput
        label="Mật khẩu"
        required
        autoComplete={newPassword ? "new-password" : "current-password"}
        autoCorrect={false}
        {...props}
      />
      {newPassword ? (
        <PasswordStrengthMeter password={props.value ?? ""} variant="panel" />
      ) : null}
    </View>
  );
}
