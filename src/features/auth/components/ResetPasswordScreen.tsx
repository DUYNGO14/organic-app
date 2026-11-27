import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          t("auth.couldNotChangeYourPasswordPlease"),
        ),
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: t("auth.passwordChangedYouCanSignIn"),
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
      title={t("auth.resetPassword")}
      subtitle={t("auth.createANewPasswordRatedStrong")}
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="password"
          rules={{ deps: "confirmation" }}
          render={({ field, fieldState }) => (
            <AuthPasswordInput
              newPassword
              label={t("auth.newPassword")}
              placeholder={t("auth.enterYourNewPassword")}
              editable={!isSubmitting}
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
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
              label={t("auth.confirmNewPassword")}
              placeholder={t("auth.reEnterYourNewPassword2")}
              required
              autoComplete="new-password"
              autoCorrect={false}
              editable={!isSubmitting}
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
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
          title={t("auth.saveNewPassword")}
          disabled={!isStrongPassword(password)}
          loading={isSubmitting}
          onPress={() => void submit()}
        />
      </View>
      <Link href="/(auth)/login" dismissTo asChild>
        <Pressable className="min-h-12 items-center justify-center" disabled={isSubmitting}>
          <Text className="font-vietnam text-label-lg text-primary">{t("auth.backToSignIn")}</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}
