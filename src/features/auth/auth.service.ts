import { i18n } from "@/localization";
import type { ApiResponse } from "@/types/api";
import type { AuthSession } from "@/types/user";
import { unwrapApiResponse } from "@/lib/axios";
import { create } from "axios";
import { createURL } from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import { Platform } from "react-native";
import { z } from "zod";
import { authApiBaseUrl, isDemoAuthEnabled } from "./auth.config";
import { demoAuth } from "./demo-auth";

export type LoginCredentials = { email: string; password: string };
export type RegisterCredentials = LoginCredentials & { name: string };
export type SocialProvider = "google" | "facebook";
export type EmailOtpPurpose = "register" | "reset-password";

const authApi = create({ timeout: 15_000 });
const httpsUrlSchema = z.url({ protocol: /^https$/, hostname: /.+/ });
const userSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  phone: z.string().optional(),
});
const sessionSchema = z.object({
  accessToken: z.string().trim().min(1),
  refreshToken: z.string().min(1).optional(),
  userData: userSchema,
});
const oauthStartSchema = z.object({
  authorizationUrl: httpsUrlSchema,
  exchangeToken: z.string().min(1),
});
const emailOtpSchema = z.object({
  challengeId: z.string().trim().min(1),
  expiresInSeconds: z.number().int().positive(),
  resendAfterSeconds: z.number().int().nonnegative(),
});
const resetGrantSchema = z.object({ resetToken: z.string().trim().min(1) });

export type EmailOtpChallenge = {
  challengeId: string;
  expiresAt: number;
  resendAt: number;
};

async function postAuth(path: string, body: object) {
  const baseURL = authApiBaseUrl;
  if (!baseURL) {
    throw new Error(i18n.t("auth.theAppIsNotConnectedTo"));
  }
  if (!httpsUrlSchema.safeParse(baseURL).success) {
    throw new Error(i18n.t("auth.theAuthenticationServerMustUseHttps"));
  }

  const { data } = await authApi.post<ApiResponse>(path, body, { baseURL });
  return unwrapApiResponse(data);
}

function readSession(data: unknown): AuthSession {
  const result = sessionSchema.safeParse(data);
  if (!result.success) {
    throw new Error(i18n.t("auth.theAuthenticationServerReturnedAnInvalid"));
  }
  return result.data;
}

export async function login(credentials: LoginCredentials) {
  if (isDemoAuthEnabled) return demoAuth.login(credentials);
  return readSession(await postAuth("/auth/login", credentials));
}

export async function register(credentials: RegisterCredentials) {
  if (isDemoAuthEnabled) return readEmailOtp(demoAuth.register(credentials));
  return readEmailOtp(await postAuth("/auth/register", credentials));
}

export async function requestPasswordReset(email: string) {
  if (isDemoAuthEnabled) return readEmailOtp(demoAuth.requestPasswordReset(email));
  return readEmailOtp(await postAuth("/auth/forgot-password", { email }));
}

function readEmailOtp(data: unknown): EmailOtpChallenge {
  const result = emailOtpSchema.safeParse(data);
  if (!result.success) {
    throw new Error(i18n.t("auth.theServerDidNotReturnValid"));
  }
  const { challengeId, expiresInSeconds, resendAfterSeconds } = result.data;
  const now = Date.now();
  return {
    challengeId,
    expiresAt: now + expiresInSeconds * 1_000,
    resendAt: now + resendAfterSeconds * 1_000,
  };
}

type EmailOtpRequest = { challengeId: string; purpose: EmailOtpPurpose };

export async function resendEmailOtp(request: EmailOtpRequest) {
  if (isDemoAuthEnabled) return readEmailOtp(demoAuth.resendEmailOtp(request));
  return readEmailOtp(await postAuth("/auth/resend-otp", request));
}

export async function verifyEmailOtp(request: EmailOtpRequest & { code: string }) {
  const data = isDemoAuthEnabled ? demoAuth.verifyEmailOtp(request) : await postAuth("/auth/verify-otp", request);
  if (request.purpose === "register") return { purpose: request.purpose } as const;

  const result = resetGrantSchema.safeParse(data);
  if (!result.success) {
    throw new Error(i18n.t("auth.theServerHasNotAuthorizedA"));
  }
  return { purpose: request.purpose, resetToken: result.data.resetToken } as const;
}

export async function resetPassword(resetToken: string, password: string) {
  if (isDemoAuthEnabled) return demoAuth.resetPassword(resetToken, password);
  await postAuth("/auth/reset-password", { resetToken, password });
}

export async function loginWithProvider(provider: SocialProvider) {
  if (isDemoAuthEnabled) {
    throw new Error(i18n.t("auth.googleAndFacebookSignInRequire"));
  }
  if (Platform.OS === "web") {
    throw new Error(i18n.t("auth.googleAndFacebookSignInAre"));
  }

  const redirectUri = createURL("login", { scheme: "organiccorporateapp" });
  const start = oauthStartSchema.safeParse(
    await postAuth(`/auth/oauth/${provider}/start`, { redirectUri }),
  );
  if (!start.success) {
    throw new Error(i18n.t("auth.couldNotStartSignInPlease"));
  }

  const { authorizationUrl, exchangeToken } = start.data;
  const result = await openAuthSessionAsync(authorizationUrl, redirectUri);
  if (result.type !== "success") return null;

  if (!result.url.startsWith(`${redirectUri}?`)) {
    throw new Error(i18n.t("auth.couldNotVerifyTheSignIn"));
  }
  const codes = new URL(result.url).searchParams.getAll("code");
  if (codes.length !== 1 || !codes[0]) {
    throw new Error(i18n.t("auth.noSignInCodeWasReceived"));
  }

  return readSession(
    await postAuth(`/auth/oauth/${provider}/exchange`, {
      code: codes[0],
      exchangeToken,
      redirectUri,
    }),
  );
}
