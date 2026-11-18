import { useAuthStore } from "@/features/auth/auth.store";
import { create, isAxiosError } from "axios";

/**
 * API root shared by all feature API modules.
 * Set EXPO_PUBLIC_API_URL to point to the real backend; DummyJSON is only the sample default.
 */
export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://dummyjson.com",
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.accessToken;
  if (token && !token.startsWith("demo-")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.",
): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.code === "ECONNABORTED") {
      return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
    }
    if (!error.response) {
      return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.";
    }
    return error.response.data?.message ?? error.response.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
