import { z } from "zod";
import { isStrongPassword } from "./password-strength";

const emailSchema = z
  .string()
  .trim()
  .min(1, "auth.enterYourEmailAddress")
  .pipe(z.email("auth.enterAValidEmailAddress"));
const passwordSchema = z.string().min(1, "auth.enterYourPassword");
const newPasswordSchema = passwordSchema.refine(
  isStrongPassword,
  "auth.yourPasswordMustBeRatedStrong",
);

export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "auth.enterYourFullName"),
  password: newPasswordSchema,
});

export const forgotPasswordSchema = loginSchema.pick({ email: true });

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmation: z.string().min(1, "auth.reEnterYourNewPassword"),
  })
  .refine(({ password, confirmation }) => password === confirmation, {
    path: ["confirmation"],
    error: "auth.thePasswordsDonTMatch",
  });

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "auth.theVerificationCodeMustContain6");

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
