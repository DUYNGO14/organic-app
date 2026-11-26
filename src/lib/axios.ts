import { getAccessToken } from "@/features/auth/auth.store";
import type { ApiError, ApiResponse } from "@/types/api";
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
  const token = getAccessToken();
  if (token && !token.startsWith("demo-")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiErrorBody = Partial<ApiError> & { error?: string };

export function unwrapApiResponse<T>(response: ApiResponse<T> | ApiError): T {
  if (response?.success !== true || !("data" in response)) {
    throw new Error(
      getResponseErrorMessage(response) ?? "Phản hồi từ máy chủ không hợp lệ.",
    );
  }
  return response.data;
}

function getResponseErrorMessage(body?: ApiErrorBody | ApiResponse) {
  if (typeof body?.message === "string" && body.message) return body.message;
  if (!body || typeof body !== "object") return undefined;

  const fieldMessage = "errors" in body && Array.isArray(body.errors)
    ? body.errors[0]?.message
    : undefined;
  if (typeof fieldMessage === "string" && fieldMessage) return fieldMessage;
  if ("error" in body && typeof body.error === "string") return body.error;
}

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
    return getResponseErrorMessage(error.response.data) ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
