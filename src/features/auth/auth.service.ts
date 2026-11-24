import type { AuthSession } from "@/features/auth/auth.store";

/** Local demo authentication. Replace with the real send/verify OTP API before release. */
export const DEMO_OTP = "123456";
export const OTP_EXPIRED_MESSAGE = "Mã OTP đã hết hạn. Vui lòng nhận mã mới.";
const otpValidityMs = 3 * 60 * 1_000;

let activeOtp: { phone: string; expiresAt: number } | undefined;

export function requestOtp(phone: string): number {
  const expiresAt = Date.now() + otpValidityMs;
  activeOtp = { phone, expiresAt };
  return expiresAt;
}

export function getOtpExpiresAt(phone: string): number | null {
  return activeOtp?.phone === phone ? activeOtp.expiresAt : null;
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<AuthSession> {
  const requestedOtp = activeOtp;
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (
    requestedOtp !== activeOtp ||
    requestedOtp?.phone !== phone ||
    Date.now() >= requestedOtp.expiresAt
  ) {
    throw new Error(OTP_EXPIRED_MESSAGE);
  }

  if (code !== DEMO_OTP) {
    throw new Error("Mã OTP chưa chính xác. Mã demo hiện tại là 123456.");
  }

  return {
    accessToken: `demo-access-${phone}`,
    phone,
  };
}
