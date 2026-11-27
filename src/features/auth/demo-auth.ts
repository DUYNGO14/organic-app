import { i18n } from "@/localization";
import type { AuthSession } from "@/types/user";
import type { EmailOtpPurpose, LoginCredentials, RegisterCredentials } from "./auth.service";

export const DEMO_OTP = "123456";
export const demoLoginCredentials = {
  email: "demo@adigo.test",
  password: "AdigoDemo123!",
} as const;

type DemoOtpRequest = { challengeId: string; purpose: EmailOtpPurpose };
type DemoVerification =
  | { purpose: "register"; account: RegisterCredentials }
  | { purpose: "reset-password"; email: string };
type DemoChallenge = DemoVerification & {
  challengeId: string;
  expiresAt: number;
  resendAt: number;
};

const accounts = new Map<string, RegisterCredentials>();
let activeChallenge: DemoChallenge | null = null;
let resetGrant: { token: string; email: string; expiresAt: number } | null = null;
let nextId = 0;

function findAccount(email: string) {
  if (email === demoLoginCredentials.email && !accounts.has(email)) {
    return { ...demoLoginCredentials, name: i18n.t("auth.demoCustomer") };
  }
  return accounts.get(email);
}

function issueChallenge(verification: DemoVerification) {
  const now = Date.now();
  const response = {
    challengeId: `demo-otp-${++nextId}`,
    expiresInSeconds: 300,
    resendAfterSeconds: 10,
  };
  activeChallenge = {
    ...verification,
    challengeId: response.challengeId,
    expiresAt: now + response.expiresInSeconds * 1_000,
    resendAt: now + response.resendAfterSeconds * 1_000,
  };
  return response;
}

function requireChallenge({ challengeId, purpose }: DemoOtpRequest) {
  if (activeChallenge?.challengeId !== challengeId || activeChallenge.purpose !== purpose) {
    throw new Error(i18n.t("auth.thisCodeIsNoLongerValid"));
  }
  return activeChallenge;
}

export const demoAuth = {
  login({ email, password }: LoginCredentials): AuthSession {
    const account = findAccount(email.toLowerCase());
    if (!account || account.password !== password) {
      throw new Error(i18n.t("auth.theEmailOrPasswordIsIncorrect"));
    }
    return {
      accessToken: `demo-access-${++nextId}`,
      userData: { email: account.email, name: account.name },
    };
  },

  register(account: RegisterCredentials) {
    const email = account.email.toLowerCase();
    if (findAccount(email)) throw new Error(i18n.t("auth.thisEmailIsAlreadyRegistered"));
    return issueChallenge({ purpose: "register", account: { ...account, email } });
  },

  requestPasswordReset(email: string) {
    resetGrant = null;
    return issueChallenge({ purpose: "reset-password", email: email.toLowerCase() });
  },

  resendEmailOtp(request: DemoOtpRequest) {
    const challenge = requireChallenge(request);
    if (Date.now() < challenge.resendAt) {
      throw new Error(i18n.t("auth.waitBeforeRequestingAnotherCode"));
    }
    return issueChallenge(challenge);
  },

  verifyEmailOtp(request: DemoOtpRequest & { code: string }) {
    const challenge = requireChallenge(request);
    if (Date.now() >= challenge.expiresAt) {
      throw new Error(i18n.t("auth.theCodeHasExpiredRequestA"));
    }
    if (request.code !== DEMO_OTP) throw new Error(i18n.t("auth.theCodeIsIncorrect"));

    if (challenge.purpose === "register") {
      accounts.set(challenge.account.email, challenge.account);
      activeChallenge = null;
      return null;
    }

    if (!findAccount(challenge.email)) {
      throw new Error(i18n.t("auth.noDemoAccountExistsForThis"));
    }
    const token = `demo-reset-${++nextId}`;
    resetGrant = { token, email: challenge.email, expiresAt: Date.now() + 300_000 };
    activeChallenge = null;
    return { resetToken: token };
  },

  resetPassword(token: string, password: string) {
    if (resetGrant?.token !== token || Date.now() >= resetGrant.expiresAt) {
      throw new Error(i18n.t("auth.thePasswordResetSessionHasExpired"));
    }
    const account = findAccount(resetGrant.email);
    if (!account) throw new Error(i18n.t("auth.noDemoAccountExistsForThis"));
    accounts.set(account.email, { ...account, password });
    resetGrant = null;
  },
};
