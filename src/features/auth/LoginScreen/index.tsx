import { PhoneInput, PrimaryBtn } from "@/components/common";
import { router } from "expo-router";
import { ArrowRight, BadgeCheck } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import {
  Controller,
  useForm,
  type Resolver,
  type ResolverResult,
  type ResolverSuccess,
} from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const { colorScheme } = useColorScheme();
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    defaultValues: { phone: "" },
    mode: "onChange",
    resolver: loginResolver,
  });

  function handleContinue({ phone }: LoginFormValues) {
    router.push({ pathname: "/(auth)/verify-otp", params: { phone } });
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pb-6 pt-5">
            <View
              className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-secondary-container/20"
              pointerEvents="none"
            />
            <View
              className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/5 dark:bg-primary/10"
              pointerEvents="none"
            />

            <View className="z-10 items-center">
              <View className="mb-5 flex-row items-center gap-2 rounded-full bg-surface-container px-3 py-2 dark:bg-surface-container-low">
                <BadgeCheck color="#006b35" size={16} />
                <Text className="font-vietnam text-label-sm uppercase tracking-wider text-primary">
                  Tiêu chuẩn canh tác hữu cơ
                </Text>
              </View>

              <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border border-primary/10 bg-surface-container-lowest dark:bg-surface-container-low">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary-container/50 dark:bg-primary/20">
                  <Image
                    accessibilityLabel="Organic Việt Nam"
                    className="h-full w-full"
                    source={require("@/assets/images/logo.png")}
                  />
                </View>
              </View>

              <Text className="text-center font-vietnam text-headline-lg-mobile text-primary">
                Chào mừng bạn
              </Text>
              <Text className="mt-2 max-w-xs text-center font-vietnam text-body-md text-muted">
                Đăng nhập để khám phá nông sản hữu cơ từ những trang trại Việt
                Nam.
              </Text>
            </View>

            <View className="z-10 mt-8 gap-5">
              <View>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <PhoneInput
                      accessibilityLabel="Số điện thoại"
                      error={fieldState.error?.message}
                      label="Số điện thoại"
                      onBlur={field.onBlur}
                      onChangeText={(value) =>
                        field.onChange(normalizeVietnamPhone(value))
                      }
                      value={field.value}
                    />
                  )}
                />
                <Text className="mt-2 font-vietnam text-body-sm text-muted">
                  Nhập 9 số điện thoại sau mã quốc gia +84.
                </Text>
              </View>

              <PrimaryBtn
                accessibilityLabel="Tiếp tục bằng số điện thoại"
                className="w-full"
                disabled={!formState.isValid}
                fullWidth
                onPress={() => void handleSubmit(handleContinue)()}
                title="Tiếp tục"
                trailingIcon={
                  <ArrowRight
                    color={colorScheme === "dark" ? "#00391b" : "#ffffff"}
                    size={18}
                  />
                }
              />

              <Text className="text-center font-vietnam text-body-sm text-muted">
                Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng và chính
                sách bảo mật.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
