import { i18n } from "@/localization";
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
      getResponseErrorMessage(response) ?? i18n.t("common.invalidServerResponse"),
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
  fallback = i18n.t("common.genericRequestError"),
): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.code === "ECONNABORTED") {
      return i18n.t("common.requestTimeout");
    }
    if (!error.response) {
      return i18n.t("common.networkError");
    }
    return getResponseErrorMessage(error.response.data) ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
