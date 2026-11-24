import { Checkbox, PhoneInput } from "@/components/common";
import { requestOtp } from "@/features/auth/auth.service";
import { acceptLegalDocuments } from "@/features/legal/legal.service";
import {
  AuthScreenLayout,
  AuthSubmitButton,
} from "@/features/auth/components/AuthScreenLayout";
import { useAppColors } from "@/hooks/use-app-colors";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import {
  Controller,
  useForm,
  type Resolver,
  type ResolverResult,
  type ResolverSuccess,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[35789]\d{8}$/,
      "Vui lòng nhập số điện thoại di động Việt Nam hợp lệ.",
    ),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginResolver: Resolver<LoginFormValues> = async (
  values,
): Promise<ResolverResult<LoginFormValues>> => {
  const result = loginSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    } as ResolverSuccess<LoginFormValues>;
  }

  return {
    values: {} as Record<string, never>,
    errors: {
      phone: {
        type: "zod",
        message:
          result.error.issues[0]?.message ?? "Số điện thoại không hợp lệ.",
      },
    },
  };
};

function normalizeVietnamPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("0084")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("84") && digits.length > 9) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

export default function LoginScreen() {
  const { onPrimary } = useAppColors();
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    defaultValues: { phone: "" },
    mode: "onChange",
    resolver: loginResolver,
  });
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  async function handleContinue({ phone }: LoginFormValues) {
    if (!hasAcceptedTerms) return;
    await acceptLegalDocuments(phone, ["terms", "privacy"], "login");
    requestOtp(phone);
    router.push({ pathname: "/(auth)/verify-otp", params: { phone } });
  }

  return (
    <AuthScreenLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn đến với ADIGO. Nhập số điện thoại để tiếp tục."
    >
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <PhoneInput
            required
            variant="inset"
            error={fieldState.error?.message}
            helperText="Nhập 9 chữ số sau mã quốc gia +84."
            label="Số điện thoại"
            onBlur={field.onBlur}
            onChangeText={(value) =>
              field.onChange(normalizeVietnamPhone(value))
            }
            value={field.value}
          />
        )}
      />

      <AuthSubmitButton
        disabled={!formState.isValid || !hasAcceptedTerms}
        loading={formState.isSubmitting}
        onPress={() => void handleSubmit(handleContinue)()}
        title="Nhận mã OTP"
        trailingIcon={<ArrowRight color={onPrimary} size={18} />}
      />
      <View className="gap-1">
        <Checkbox
          checked={hasAcceptedTerms}
          description="Tôi đã đọc và đồng ý với các tài liệu dự thảo bên dưới."
          label="Xác nhận điều khoản"
          onCheckedChange={setHasAcceptedTerms}
        />
        <View className="flex-row flex-wrap gap-x-3 pl-8">
          <Pressable accessibilityRole="link" onPress={() => router.push("/legal/terms")}>
            <Text className="font-vietnam text-body-sm text-primary">Điều khoản sử dụng</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push("/legal/privacy")}>
            <Text className="font-vietnam text-body-sm text-primary">Chính sách bảo mật</Text>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}
