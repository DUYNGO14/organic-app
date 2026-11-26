import { OTPInput } from "@/components/common";
import {
  DEMO_OTP,
  getOtpExpiresAt,
  OTP_EXPIRED_MESSAGE,
  requestOtp,
  verifyOtp,
} from "@/features/auth/auth.service";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  AuthScreenLayout,
  AuthSubmitButton,
} from "@/features/auth/components/AuthScreenLayout";
import { useAppColors } from "@/hooks/use-app-colors";
import { useCountdown } from "@/hooks/use-countdown";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { ArrowRight, Pencil, Phone } from "lucide-react-native";
import { useState } from "react";
import {
  Controller,
  useForm,
  type Resolver,
  type ResolverResult,
  type ResolverSuccess,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Nhập đủ 6 chữ số OTP."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function maskPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 3)} *** ${digits.slice(-3)}`;
}

const otpResolver: Resolver<OtpFormValues> = async (
  values,
): Promise<ResolverResult<OtpFormValues>> => {
  const result = otpSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    } as ResolverSuccess<OtpFormValues>;
  }

  return {
    values: {} as Record<string, never>,
    errors: {
      code: {
        type: "zod",
        message: result.error.issues[0]?.message ?? "Mã OTP không hợp lệ.",
      },
    },
  };
};

export default function OtpScreen() {
  const { onPrimary, primary } = useAppColors();
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof phoneParam === "string" ? phoneParam : "";
  const [expiresAt, setExpiresAt] = useState(() => getOtpExpiresAt(phone));
  const { remainingSeconds, isExpired } = useCountdown(expiresAt);
  const needsNewCode = expiresAt === null || isExpired;
  const signIn = useAuthStore((state) => state.signIn);
  const { control, handleSubmit, reset, setError, formState } = useForm<OtpFormValues>(
    {
      defaultValues: { code: "" },
      mode: "onChange",
      resolver: otpResolver,
    },
  );

  async function handleVerify({ code }: OtpFormValues) {
    if (!phone) {
      setError("code", {
        type: "validate",
        message: "Không tìm thấy số điện thoại. Vui lòng quay lại đăng nhập.",
      });
      return;
    }

    try {
      const session = await verifyOtp(phone, code);
      await signIn(session);
      const { returnTo } = useAuthStore.getState();
      useAuthStore.setState({ returnTo: null });
      router.replace((returnTo as Href | null) ?? "/(tabs)/home");
    } catch (error) {
      setError("code", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác minh mã OTP. Vui lòng thử lại.",
      });
    }
  }

  function editPhone() {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login");
  }

  function resendOtp() {
    if (!phone) {
      editPhone();
      return;
    }

    reset({ code: "" });
    setExpiresAt(requestOtp(phone));
  }

  return (
    <AuthScreenLayout
      title="Nhập mã xác thực"
      subtitle={phone ? "Mã OTP đã được gửi đến số điện thoại của bạn." : "Vui lòng nhập số điện thoại để nhận mã OTP."}
    >
      <View className="gap-3">
        {phone ? (
          <View className="min-h-12 flex-row items-center rounded-full border border-card-border bg-surface-container-low/90 pl-4">
            <Phone color={primary} size={15} />
            <Text className="ml-2 min-w-0 flex-1 font-vietnam text-label-md text-ink">
              +84 {maskPhoneNumber(phone)}
            </Text>
            <Pressable
              accessibilityLabel="Thay đổi số điện thoại"
              accessibilityRole="button"
              className="min-h-12 flex-row items-center gap-1 rounded-full px-3 active:bg-surface-container"
              hitSlop={4}
              onPress={editPhone}
            >
              <Text className="font-vietnam text-label-sm text-primary">Thay đổi</Text>
              <Pencil color={primary} size={13} />
            </Pressable>
          </View>
        ) : null}
        <Controller
          control={control}
          name="code"
          render={({ field, fieldState }) => (
            <OTPInput
              required
              autoFocus={!needsNewCode}
              disabled={needsNewCode || formState.isSubmitting}
              variant="inset"
              error={fieldState.error?.message}
              label="Mã OTP 6 chữ số"
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />
        {needsNewCode ? (
          <Text
            accessibilityLiveRegion="polite"
            className="font-vietnam text-body-sm text-danger"
          >
            {phone
              ? OTP_EXPIRED_MESSAGE
              : "Vui lòng nhập số điện thoại để nhận mã OTP."}
          </Text>
        ) : remainingSeconds !== null ? (
          <>
            <Text className="font-vietnam text-body-sm text-muted">
              Mã hết hạn sau{" "}
              <Text
                className="font-vietnam text-label-md text-primary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
                {String(remainingSeconds % 60).padStart(2, "0")}
              </Text>
            </Text>
            <View className="rounded-md border border-card-border bg-surface-container-low/90 px-3 py-2">
              <Text className="font-vietnam text-body-sm text-muted">
                Chế độ demo: dùng mã{" "}
                <Text className="font-vietnam text-label-sm text-ink">
                  {DEMO_OTP}
                </Text>
                . Chưa gửi SMS thật.
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {needsNewCode ? (
        <AuthSubmitButton
          onPress={phone ? resendOtp : editPhone}
          title={phone ? "Nhận lại mã OTP" : "Nhập số điện thoại"}
        />
      ) : (
        <AuthSubmitButton
          disabled={!formState.isValid}
          loading={formState.isSubmitting}
          onPress={() => void handleSubmit(handleVerify)()}
          title="Xác nhận và tiếp tục"
          trailingIcon={<ArrowRight color={onPrimary} size={18} />}
        />
      )}
    </AuthScreenLayout>
  );
}
