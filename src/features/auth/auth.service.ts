import type { AuthSession } from "@/features/auth/auth.store";

/** Local demo authentication. Replace with the real send/verify OTP API before release. */
export const DEMO_OTP = "123456";

export async function verifyOtp(phone: string, code: string): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (code !== DEMO_OTP) {
    throw new Error("Mã OTP chưa chính xác. Mã demo hiện tại là 123456.");
  }

  return {
    accessToken: `demo-access-${phone}`,
    phone,
  };
}
