import { PasswordInput } from "@/components/common";
import { createAuthFormResolver } from "@/features/auth/auth-form-resolver";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/auth.schema";
import { resetPassword } from "@/features/auth/auth.service";
import { useEmailVerification } from "@/features/auth/email-verification";
import { isStrongPassword } from "@/features/auth/password-strength";
import { getApiErrorMessage } from "@/lib/axios";
import { Link, router } from "expo-router";
import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthScreenLayout, AuthSubmitButton } from "./AuthScreenLayout";

const resolver =
  createAuthFormResolver<ResetPasswordInput>(resetPasswordSchema);

export function ResetPasswordScreen({ resetToken }: { resetToken: string }) {
  const { setChallenge } = useEmailVerification();
  const submitting = useRef(false);
  const { control, handleSubmit, formState, setError } =
    useForm<ResetPasswordInput>({
      defaultValues: { password: "", confirmation: "" },
      resolver,
    });
  const password = useWatch({ control, name: "password" });
  const { errors, isSubmitting } = formState;

  async function save({ password }: ResetPasswordInput) {
    try {
      await resetPassword(resetToken, password);
    } catch (error) {
      setError("root.server", {
        message: getApiErrorMessage(
          error,
          "Không thể đổi mật khẩu. Vui lòng thử lại.",
        ),
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Đã đổi mật khẩu. Bạn có thể đăng nhập lại.",
    });
    router.dismissTo("/(auth)/login");
    setChallenge(null);
  }

  async function submit() {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await handleSubmit(save)();
    } finally {
      submitting.current = false;
    }
  }

  return (
    <AuthScreenLayout
      title="Đặt lại mật khẩu"
      subtitle="Tạo mật khẩu mới đạt mức Mạnh cho tài khoản của bạn."
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="password"
          rules={{ deps: "confirmation" }}
          render={({ field, fieldState }) => (
            <AuthPasswordInput
              newPassword
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              editable={!isSubmitting}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmation"
          render={({ field, fieldState }) => (
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              required
              autoComplete="new-password"
              autoCorrect={false}
              editable={!isSubmitting}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={() => void submit()}
              returnKeyType="done"
              value={field.value}
            />
          )}
        />
        {errors.root?.server?.message ? (
          <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">
            {errors.root.server.message}
          </Text>
        ) : null}
        <AuthSubmitButton
          title="Lưu mật khẩu mới"
          disabled={!isStrongPassword(password)}
          loading={isSubmitting}
          onPress={() => void submit()}
        />
      </View>
      <Link href="/(auth)/login" dismissTo asChild>
        <Pressable className="min-h-12 items-center justify-center" disabled={isSubmitting}>
          <Text className="font-vietnam text-label-lg text-primary">Về trang đăng nhập</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}
