import { createContext, useContext, useState, type PropsWithChildren } from "react";
import type { EmailOtpChallenge, EmailOtpPurpose } from "./auth.service";

export type PendingEmailVerification = EmailOtpChallenge & {
  email: string;
  purpose: EmailOtpPurpose;
};

const EmailVerificationContext = createContext<{
  challenge: PendingEmailVerification | null;
  setChallenge: (challenge: PendingEmailVerification | null) => void;
} | null>(null);

export function EmailVerificationProvider({ children }: PropsWithChildren) {
  const [challenge, setChallenge] = useState<PendingEmailVerification | null>(null);
  return (
    <EmailVerificationContext.Provider value={{ challenge, setChallenge }}>
      {children}
    </EmailVerificationContext.Provider>
  );
}

export function useEmailVerification() {
  const value = useContext(EmailVerificationContext);
  if (!value) throw new Error("Email verification requires EmailVerificationProvider.");
  return value;
}
