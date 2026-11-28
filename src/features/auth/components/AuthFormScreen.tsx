import { useTranslation } from "react-i18next";
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
import { cancelSignIn } from "@/features/auth/member-access";
import { isStrongPassword } from "@/features/auth/password-strength";
import { getApiErrorMessage } from "@/lib/axios";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { t } = useTranslation();
  const isRegister = mode === "register";
  const signIn = useAuthStore((state) => state.signIn);
  const { setChallenge } = useEmailVerification();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const activeAction = useRef(false);
  const mounted = useRef(false);
  const { control, handleSubmit, formState, setError, clearErrors, setValue, reset } =
    useForm<RegisterInput, unknown, AuthCredentials>({
      defaultValues: { name: "", email: "", password: "" },
      resolver: isRegister ? registerResolver : loginResolver,
    });
  const password = useWatch({ control, name: "password", disabled: !isRegister });
  const busy = pending !== null;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

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
      if (mounted.current) {
        setError("root.server", { message: getApiErrorMessage(error, fallback) });
      }
    } finally {
      activeAction.current = false;
      if (mounted.current) setPending(null);
    }
  }

  async function submitCredentials(credentials: AuthCredentials) {
    if ("name" in credentials) {
      if (!acceptedTerms) return;
      await run(
        "form",
        async () => {
          const challenge = await register(credentials);
          if (!mounted.current) return;
          setChallenge({
            ...challenge,
            email: credentials.email,
            purpose: "register",
          });
          router.push("/(auth)/verify-otp");
        },
        t("auth.couldNotSignUpPleaseTry"),
      );
      return;
    }

    await run(
      "form",
      async () => {
        const session = await login(credentials);
        if (mounted.current) await signIn(session);
      },
      t("auth.couldNotSignInPleaseTry"),
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
        if (session && mounted.current) await signIn(session);
      },
      t("auth.couldNotSignInPleaseTry"),
    );
  }

  return (
    <AuthScreenLayout
      title={isRegister ? t("auth.createAnAccount") : t("auth.signIn")}
      onCancel={!isRegister && !busy ? cancelSignIn : undefined}
      subtitle={
        isRegister
          ? t("auth.enterYourInformationToReceiveA")
          : t("auth.welcomeToAdigo")
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
            <Text className="font-vietnam text-body-sm text-warning">{t("auth.demoMode")}</Text>
            <Text className="font-vietnam text-label-md text-warning">{t("auth.useADemoAccount")}</Text>
          </Pressable>
        ) : null}
        {isRegister ? (
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label={t("auth.fullName")}
                required
                autoCapitalize="words"
                autoComplete="name"
                editable={!busy}
                error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder={t("auth.enterYourFullName2")}
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
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
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
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
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
              description={t("auth.iHaveReadAndAgreeTo")}
              disabled={busy}
              label={t("auth.acceptTheTerms")}
              onCheckedChange={setAcceptedTerms}
            />
            <View className="flex-row flex-wrap gap-x-4 pl-8">
              <Link href="/legal/terms" asChild>
                <Pressable className="min-h-12 justify-center" disabled={busy}>
                  <Text className="font-vietnam text-body-sm text-primary">
                    {t("auth.termsOfUse")}</Text>
                </Pressable>
              </Link>
              <Link href="/legal/privacy" asChild>
                <Pressable className="min-h-12 justify-center" disabled={busy}>
                  <Text className="font-vietnam text-body-sm text-primary">
                    {t("auth.privacyPolicy")}</Text>
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
                {t("auth.forgotYourPassword")}</Text>
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
          title={isRegister ? t("auth.signUp") : t("auth.signIn")}
        />
      </View>
      <SocialLoginButtons
        disabled={busy}
        pending={pending === "form" ? null : pending}
        onSelect={submitProvider}
      />

      <View className="flex-row flex-wrap items-center justify-center gap-x-2">
        <Text className="font-vietnam text-body-md text-muted">
          {isRegister ? t("auth.alreadyHaveAnAccount") : t("auth.newToAdigo")}
        </Text>
        <Link
          href={isRegister ? "/(auth)/login" : "/(auth)/register"}
          dismissTo={isRegister}
          asChild
        >
          <Pressable className="min-h-12 justify-center" disabled={busy}>
            <Text className="font-vietnam text-label-lg text-primary">
              {isRegister ? t("auth.signIn") : t("auth.signUp")}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
