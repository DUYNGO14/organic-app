import { z } from "zod";
import { isStrongPassword } from "./password-strength";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email.")
  .pipe(z.email("Vui lòng nhập email hợp lệ."));
const passwordSchema = z.string().min(1, "Vui lòng nhập mật khẩu.");
const newPasswordSchema = passwordSchema.refine(
  isStrongPassword,
  "Mật khẩu phải đạt mức Mạnh.",
);

export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên."),
  password: newPasswordSchema,
});

export const forgotPasswordSchema = loginSchema.pick({ email: true });

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmation: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine(({ password, confirmation }) => password === confirmation, {
    path: ["confirmation"],
    error: "Hai mật khẩu chưa khớp.",
  });

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Mã OTP phải gồm 6 chữ số.");

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
