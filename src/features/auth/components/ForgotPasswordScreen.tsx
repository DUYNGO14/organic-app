import { useTranslation } from "react-i18next";
import { createAuthFormResolver } from "@/features/auth/auth-form-resolver";
import { isDemoAuthEnabled } from "@/features/auth/auth.config";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/auth.schema";
import { requestPasswordReset } from "@/features/auth/auth.service";
import { demoLoginCredentials } from "@/features/auth/demo-auth";
import { useEmailVerification } from "@/features/auth/email-verification";
import { Link, router } from "expo-router";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { AuthEmailInput } from "./AuthEmailInput";
import { AuthScreenLayout, AuthSubmitButton } from "./AuthScreenLayout";

const resolver = createAuthFormResolver<ForgotPasswordInput>(forgotPasswordSchema);

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { setChallenge } = useEmailVerification();
  const activeRequest = useRef(false);
  const { control, handleSubmit, formState, setError } =
    useForm<ForgotPasswordInput>({
      defaultValues: { email: isDemoAuthEnabled ? demoLoginCredentials.email : "" },
      resolver,
    });
  const { errors, isSubmitting } = formState;

  async function requestReset({ email }: ForgotPasswordInput) {
    try {
      const challenge = await requestPasswordReset(email);
      setChallenge({ ...challenge, email, purpose: "reset-password" });
      router.push("/(auth)/verify-otp");
    } catch {
      setError("root.server", {
        message: t("auth.couldNotSendTheRequestPlease"),
      });
    }
  }

  async function submit() {
    if (activeRequest.current) return;
    activeRequest.current = true;
    try {
      await handleSubmit(requestReset)();
    } finally {
      activeRequest.current = false;
    }
  }

  return (
    <AuthScreenLayout
      title={t("auth.forgotPassword")}
      subtitle={t("auth.enterYourRegisteredEmailToReceive")}
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <AuthEmailInput
              editable={!isSubmitting}
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={() => void submit()}
              returnKeyType="send"
              value={field.value}
            />
          )}
        />
        {errors.root?.server?.message ? (
          <Text
            accessibilityRole="alert"
            className="font-vietnam text-body-sm text-danger"
          >
            {errors.root.server.message}
          </Text>
        ) : null}
        <AuthSubmitButton
          loading={isSubmitting}
          onPress={() => void submit()}
          title={t("auth.sendVerificationCode")}
        />
      </View>
      <Link href="/(auth)/login" dismissTo asChild>
        <Pressable
          className="min-h-12 items-center justify-center"
          disabled={isSubmitting}
        >
          <Text className="font-vietnam text-label-lg text-primary">
            {t("auth.backToSignIn")}</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}
