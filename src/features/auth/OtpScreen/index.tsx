import { OTPInput, PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { DEMO_OTP, verifyOtp } from "@/features/auth/auth.service";
import { useAuthStore } from "@/features/auth/auth.store";
import { router, useLocalSearchParams } from "expo-router";
import {
  Controller,
  useForm,
  type Resolver,
  type ResolverResult,
  type ResolverSuccess,
} from "react-hook-form";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Nhập đủ 6 chữ số OTP."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

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
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof phoneParam === "string" ? phoneParam : "";
  const signIn = useAuthStore((state) => state.signIn);
  const { control, handleSubmit, setError, formState } = useForm<OtpFormValues>(
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
      router.replace("/(tabs)/home");
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

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <StackHeader title="Xác minh mã OTP" />
      <View className="flex-1 px-6 pt-10">
        <Text className="font-vietnam text-headline-md text-ink">
          Nhập mã xác thực
        </Text>
        <Text className="mt-3 font-vietnam text-body-md text-muted">
          Mã xác thực được gửi đến số điện thoại +84 {phone}.
        </Text>
        <View className="mt-8">
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <OTPInput
                required
                autoFocus
                error={fieldState.error?.message}
                label="Mã OTP 6 chữ số"
                onChangeText={field.onChange}
                value={field.value}
              />
            )}
          />
          <Text className="mt-3 font-vietnam text-body-sm text-muted">
            Chế độ demo: dùng mã {DEMO_OTP}. Chưa gửi SMS thật.
          </Text>
        </View>
        <PrimaryBtn
          className="mt-8 w-full"
          disabled={!formState.isValid || !phone}
          fullWidth
          loading={formState.isSubmitting}
          onPress={() => void handleSubmit(handleVerify)()}
          title="Xác nhận và tiếp tục"
        />
      </View>
    </SafeAreaView>
  );
}
