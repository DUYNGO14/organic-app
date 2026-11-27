import { Checkbox, Input } from "@/components/common";
import { createAuthFormResolver } from "@/features/auth/auth-form-resolver";
import { isDemoAuthEnabled } from "@/features/auth/auth.config";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/features/auth/auth.schema";
import {
  login,
  loginWithProvider,
  register,
  type SocialProvider,
} from "@/features/auth/auth.service";
import { useAuthStore } from "@/features/auth/auth.store";
import { demoLoginCredentials } from "@/features/auth/demo-auth";
import { useEmailVerification } from "@/features/auth/email-verification";
import { isStrongPassword } from "@/features/auth/password-strength";
import { getApiErrorMessage } from "@/lib/axios";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { AuthEmailInput } from "./AuthEmailInput";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthScreenLayout, AuthSubmitButton } from "./AuthScreenLayout";
import { SocialLoginButtons } from "./SocialLoginButtons";

type AuthCredentials = LoginInput | RegisterInput;
type PendingAction = "form" | SocialProvider;
const loginResolver = createAuthFormResolver<RegisterInput, AuthCredentials>(loginSchema);
const registerResolver = createAuthFormResolver<RegisterInput, AuthCredentials>(registerSchema);

export function AuthFormScreen({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const signIn = useAuthStore((state) => state.signIn);
  const { setChallenge } = useEmailVerification();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const activeAction = useRef(false);
  const { control, handleSubmit, formState, setError, clearErrors, setValue, reset } =
    useForm<RegisterInput, unknown, AuthCredentials>({
      defaultValues: { name: "", email: "", password: "" },
      resolver: isRegister ? registerResolver : loginResolver,
    });
  const password = useWatch({ control, name: "password", disabled: !isRegister });
  const busy = pending !== null;

  useFocusEffect(
    useCallback(() => {
      if (!isRegister) {
        reset(undefined, { keepValues: true, keepFieldsRef: true });
      }
    }, [isRegister, reset]),
  );

  async function run(
    action: PendingAction,
    operation: () => Promise<void>,
    fallback: string,
  ) {
    if (activeAction.current) return;
    activeAction.current = true;
    clearErrors("root.server");
    setPending(action);
    try {
      await operation();
    } catch (error) {
      setError("root.server", { message: getApiErrorMessage(error, fallback) });
    } finally {
      activeAction.current = false;
      setPending(null);
    }
  }

  async function submitCredentials(credentials: AuthCredentials) {
    if ("name" in credentials) {
      if (!acceptedTerms) return;
      await run(
        "form",
        async () => {
          const challenge = await register(credentials);
          setChallenge({
            ...challenge,
            email: credentials.email,
            purpose: "register",
          });
          router.push("/(auth)/verify-otp");
        },
        "Không thể đăng ký. Vui lòng thử lại.",
      );
      return;
    }

    await run(
      "form",
      async () => {
        await signIn(await login(credentials));
        router.replace("/(tabs)/home");
      },
      "Không thể đăng nhập. Vui lòng thử lại.",
    );
  }

  function submit() {
    void handleSubmit(submitCredentials)();
  }

  function submitProvider(provider: SocialProvider) {
    void run(
      provider,
      async () => {
        const session = await loginWithProvider(provider);
        if (!session) return;
        await signIn(session);
        router.replace("/(tabs)/home");
      },
      "Không thể đăng nhập. Vui lòng thử lại.",
    );
  }

  return (
    <AuthScreenLayout
      title={isRegister ? "Tạo tài khoản" : "Đăng nhập"}
      subtitle={
        isRegister
          ? "Nhập thông tin để nhận mã xác thực qua email."
          : "Chào mừng bạn đến với ADIGO."
      }
    >
      <View className="gap-4">
        {isDemoAuthEnabled && !isRegister ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-row flex-wrap items-center justify-between gap-2 rounded border border-warning/20 bg-warning-container px-3 py-2"
            disabled={busy}
            onPress={() => {
              clearErrors();
              setValue("email", demoLoginCredentials.email);
              setValue("password", demoLoginCredentials.password);
            }}
          >
            <Text className="font-vietnam text-body-sm text-warning">Bản thử nghiệm</Text>
            <Text className="font-vietnam text-label-md text-warning">Điền tài khoản mẫu</Text>
          </Pressable>
        ) : null}
        {isRegister ? (
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Họ và tên"
                required
                autoCapitalize="words"
                autoComplete="name"
                editable={!busy}
                error={fieldState.error?.message}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Nhập họ và tên"
                value={field.value}
              />
            )}
          />
        ) : null}
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <AuthEmailInput
              editable={!busy}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <AuthPasswordInput
              newPassword={isRegister}
              editable={!busy}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={submit}
              returnKeyType={isRegister ? "done" : "go"}
              value={field.value}
            />
          )}
        />
        {isRegister ? (
          <View>
            <Checkbox
              checked={acceptedTerms}
              description="Tôi đã đọc và đồng ý với các tài liệu dự thảo bên dưới."
              disabled={busy}
              label="Xác nhận điều khoản"
              onCheckedChange={setAcceptedTerms}
            />
            <View className="flex-row flex-wrap gap-x-4 pl-8">
              <Link href="/legal/terms" asChild>
                <Pressable className="min-h-12 justify-center" disabled={busy}>
                  <Text className="font-vietnam text-body-sm text-primary">
                    Điều khoản sử dụng
                  </Text>
                </Pressable>
              </Link>
              <Link href="/legal/privacy" asChild>
                <Pressable className="min-h-12 justify-center" disabled={busy}>
                  <Text className="font-vietnam text-body-sm text-primary">
                    Chính sách bảo mật
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : (
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable
              className="-mt-2 min-h-12 justify-center self-end"
              disabled={busy}
            >
              <Text className="font-vietnam text-label-md text-primary">
                Quên mật khẩu?
              </Text>
            </Pressable>
          </Link>
        )}
        {formState.errors.root?.server?.message ? (
          <Text
            accessibilityRole="alert"
            className="font-vietnam text-body-sm text-danger"
          >
            {formState.errors.root.server.message}
          </Text>
        ) : null}
        <AuthSubmitButton
          disabled={busy || (isRegister && (!acceptedTerms || !isStrongPassword(password)))}
          loading={pending === "form"}
          onPress={submit}
          title={isRegister ? "Đăng ký" : "Đăng nhập"}
        />
      </View>
      <SocialLoginButtons
        disabled={busy}
        pending={pending === "form" ? null : pending}
        onSelect={submitProvider}
      />

      <View className="flex-row flex-wrap items-center justify-center gap-x-2">
        <Text className="font-vietnam text-body-md text-muted">
          {isRegister ? "Bạn đã có tài khoản?" : "Bạn chưa có tài khoản?"}
        </Text>
        <Link
          href={isRegister ? "/(auth)/login" : "/(auth)/register"}
          dismissTo={isRegister}
          asChild
        >
          <Pressable className="min-h-12 justify-center" disabled={busy}>
            <Text className="font-vietnam text-label-lg text-primary">
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
