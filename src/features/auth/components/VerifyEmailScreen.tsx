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
        text1: "Email đã được xác thực",
        text2: savedTerms
          ? "Bạn có thể đăng nhập bằng tài khoản vừa tạo."
          : "Bạn có thể xác nhận lại điều khoản trong Trung tâm pháp lý.",
      });
      router.dismissTo("/(auth)/login");
      setChallenge(null);
    }, "Không thể xác thực mã OTP. Vui lòng thử lại.");
  }

  function resend() {
    if (Date.now() < currentChallenge.resendAt) return;
    void run("resend", async () => {
      const next = await resendEmailOtp(request);
      setChallenge({ ...currentChallenge, ...next });
      setCode("");
      Toast.show({
        type: "info",
        text1: isDemoAuthEnabled ? "Bạn có thể nhập lại mã thử nghiệm" : "Hãy kiểm tra email để lấy mã mới",
      });
    }, "Chưa thể gửi lại mã OTP. Vui lòng thử lại.");
  }

  return (
    <AuthScreenLayout
      title="Xác thực email"
      subtitle={isDemoAuthEnabled
        ? "Dùng mã thử nghiệm bên dưới để xem bước tiếp theo."
        : "Nhập mã OTP gồm 6 chữ số trong email. Hãy kiểm tra cả thư rác."}
    >
      <View className="gap-4">
        <View className="rounded-lg border border-card-border bg-surface-soft px-4 py-3">
          <Text className="font-vietnam text-label-md text-ink">{currentChallenge.email}</Text>
        </View>
        {isDemoAuthEnabled ? (
          <Text className="rounded bg-warning-container px-3 py-2 font-vietnam text-body-md text-warning">
            Mã OTP thử nghiệm {DEMO_OTP}
          </Text>
        ) : null}
        <OTPInput
          label="Mã OTP 6 chữ số"
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
            Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
          </Text>
        ) : null}
        <AuthSubmitButton
          title="Xác thực email"
          disabled={busy || isExpired || !isCodeValid}
          loading={pending === "verify"}
          onPress={verify}
        />
        <PrimaryBtn
          title={resendIn ? `Gửi lại mã sau ${resendIn} giây` : "Gửi lại mã OTP"}
          variant="ghost"
          fullWidth
          disabled={busy || !!resendIn}
          loading={pending === "resend"}
          onPress={resend}
        />
      </View>
      <Link href={emailRoute} dismissTo asChild>
        <Pressable className="min-h-12 items-center justify-center" disabled={busy}>
          <Text className="font-vietnam text-label-md text-primary">Thay đổi email</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}
