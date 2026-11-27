import { useTranslation } from "react-i18next";
import { OTPInput, PrimaryBtn } from "@/components/common";
import { isDemoAuthEnabled } from "@/features/auth/auth.config";
import { otpCodeSchema } from "@/features/auth/auth.schema";
import { resendEmailOtp, verifyEmailOtp } from "@/features/auth/auth.service";
import { DEMO_OTP } from "@/features/auth/demo-auth";
import { useEmailVerification } from "@/features/auth/email-verification";
import { acceptLegalDocuments } from "@/features/legal/legal.service";
import { useCountdown } from "@/hooks/use-countdown";
import { getApiErrorMessage } from "@/lib/axios";
import { Link, Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthScreenLayout, AuthSubmitButton } from "./AuthScreenLayout";
import { ResetPasswordScreen } from "./ResetPasswordScreen";

type EmailAction = "verify" | "resend";

export function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { challenge, setChallenge } = useEmailVerification();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<EmailAction | null>(null);
  const [resetToken, setResetToken] = useState<string>();
  const activeRequest = useRef(false);
  const { isExpired } = useCountdown(resetToken ? null : challenge?.expiresAt ?? null);
  const { remainingSeconds: resendIn } = useCountdown(resetToken ? null : challenge?.resendAt ?? null);

  if (!challenge) return <Redirect href="/(auth)/login" />;
  if (resetToken) return <ResetPasswordScreen resetToken={resetToken} />;

  const currentChallenge = challenge;
  const request = { challengeId: currentChallenge.challengeId, purpose: currentChallenge.purpose };
  const emailRoute = request.purpose === "register" ? "/(auth)/register" : "/(auth)/forgot-password";
  const busy = pending !== null;
  const isCodeValid = otpCodeSchema.safeParse(code).success;

  async function run(action: EmailAction, operation: () => Promise<void>, fallback: string) {
    if (activeRequest.current) return;
    activeRequest.current = true;
    setPending(action);
    setError(undefined);
    try {
      await operation();
    } catch (cause) {
      setError(getApiErrorMessage(cause, fallback));
    } finally {
      activeRequest.current = false;
      setPending(null);
    }
  }

  function verify() {
    if (Date.now() >= currentChallenge.expiresAt || !isCodeValid) return;
    void run("verify", async () => {
      const result = await verifyEmailOtp({ ...request, code });
      setCode("");
      if (result.purpose === "reset-password") {
        setResetToken(result.resetToken);
        return;
      }

      const savedTerms = await acceptLegalDocuments(
        currentChallenge.email,
        ["terms", "privacy"],
        "register",
      ).then(() => true, () => false);
      Toast.show({
        type: "success",
        text1: t("auth.emailVerified"),
        text2: savedTerms
          ? t("auth.youCanSignInWithYour")
          : t("auth.youCanAcknowledgeTheTermsAgain"),
      });
      router.dismissTo("/(auth)/login");
      setChallenge(null);
    }, t("auth.couldNotVerifyTheCodePlease"));
  }

  function resend() {
    if (Date.now() < currentChallenge.resendAt) return;
    void run("resend", async () => {
      const next = await resendEmailOtp(request);
      setChallenge({ ...currentChallenge, ...next });
      setCode("");
      Toast.show({
        type: "info",
        text1: isDemoAuthEnabled ? t("auth.youCanEnterTheDemoCode") : t("auth.checkYourEmailForTheNew"),
      });
    }, t("auth.couldNotResendTheCodePlease"));
  }

  return (
    <AuthScreenLayout
      title={t("auth.verifyEmail")}
      subtitle={isDemoAuthEnabled
        ? t("auth.useTheDemoCodeBelowTo")
        : t("auth.enterThe6DigitCodeFrom")}
    >
      <View className="gap-4">
        <View className="rounded-lg border border-card-border bg-surface-soft px-4 py-3">
          <Text className="font-vietnam text-label-md text-ink">{currentChallenge.email}</Text>
        </View>
        {isDemoAuthEnabled ? (
          <Text className="rounded bg-warning-container px-3 py-2 font-vietnam text-body-md text-warning">
            {t("auth.demoCode", { demoOtp: DEMO_OTP })}
          </Text>
        ) : null}
        <OTPInput
          label={t("auth.6DigitVerificationCode")}
          variant="inset"
          required
          autoFocus={!isExpired}
          disabled={busy || isExpired}
          error={error}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            setError(undefined);
          }}
        />
        {isExpired ? (
          <Text accessibilityLiveRegion="polite" className="font-vietnam text-body-sm text-danger">
            {t("auth.theCodeHasExpiredRequestA")}</Text>
        ) : null}
        <AuthSubmitButton
          title={t("auth.verifyEmail")}
          disabled={busy || isExpired || !isCodeValid}
          loading={pending === "verify"}
          onPress={verify}
        />
        <PrimaryBtn
          title={resendIn ? t("auth.resendInSeconds", { count: resendIn }) : t("auth.resendCode")}
          variant="ghost"
          fullWidth
          disabled={busy || !!resendIn}
          loading={pending === "resend"}
          onPress={resend}
        />
      </View>
      <Link href={emailRoute} dismissTo asChild>
        <Pressable className="min-h-12 items-center justify-center" disabled={busy}>
          <Text className="font-vietnam text-label-md text-primary">{t("auth.changeEmail")}</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}
