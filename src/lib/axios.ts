import { isAccountDisabled, shouldRefreshOn401 } from "@/features/auth/authErrors";
import { apiBaseUrl, authSession, getHttpsOrigin, trustedApiOrigin } from "@/features/auth/authRuntime";
import { logAuthEvent, SessionExpiredError, type AuthSessionManager } from "@/features/auth/authSession";
import type { ApiError, ApiResponse } from "@/types/api";
import {
  CanceledError,
  create,
  isAxiosError,
  isCancel,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { randomUUID } from "expo-crypto";

export const api = create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

installAuthInterceptors(api, authSession, trustedApiOrigin, randomUUID);

export default api;

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    retryOnAuth?: boolean;
  }
}

type AuthConfig = InternalAxiosRequestConfig & {
  _sid?: number;
  _sentToken?: string;
  _retry?: boolean;
};

function skipsAuth(url: string, trustedOrigin: string) {
  try {
    if (getHttpsOrigin(url) !== trustedOrigin) return true;
    const segments: string[] = [];
    for (const segment of decodeURIComponent(new URL(url).pathname).split(/[\\/]/)) {
      if (segment === "..") segments.pop();
      else if (segment && segment !== ".") segments.push(segment);
    }
    return /(?:^|\/)auth\/(?:login|register|otp|send[-_]?otp|verify[-_]?otp|logout)(?:\/|$)/i
      .test(segments.join("/"));
  } catch {
    return true;
  }
}

function waitForRefresh(promise: Promise<void>, config: AuthConfig) {
  const signal = config.signal;
  if (!signal?.addEventListener || !signal.removeEventListener) return promise;
  return new Promise<void>((resolve, reject) => {
    const cancel = () => reject(new CanceledError());
    signal.addEventListener?.("abort", cancel);
    if (signal.aborted) cancel();
    void promise.then(resolve, reject).finally(() => {
      signal.removeEventListener?.("abort", cancel);
    });
  });
}

export function installAuthInterceptors(
  api: AxiosInstance,
  session: AuthSessionManager,
  trustedOrigin: string | null,
  createId: () => string,
) {
  api.interceptors.request.use((config: AuthConfig) => {
    const current = session.getSnapshot();
    if (config._sid !== undefined && current?.sid !== config._sid) {
      throw new CanceledError();
    }

    const uri = api.getUri(config);
    if (!trustedOrigin || config.skipAuthRefresh || skipsAuth(uri, trustedOrigin)) {
      return config;
    }
    if (current && !current.accessToken.startsWith("demo-")) {
      config._sid ??= current.sid;
      config._sentToken = current.accessToken;
      config.headers.set("Authorization", `Bearer ${current.accessToken}`);
    }
    if (
      /^(post|put|patch|delete)$/i.test(config.method ?? "") &&
      !config.headers.has("Idempotency-Key")
    ) {
      config.headers.set("Idempotency-Key", createId());
    }
    return config;
  }, (error: unknown) => { throw error; }, { synchronous: true });

  api.interceptors.response.use(
    (response) => {
      const { _sid: sid } = response.config as AuthConfig;
      if (sid !== undefined && session.getSnapshot()?.sid !== sid) throw new CanceledError();
      return response;
    },
    async (error: unknown) => {
      if (!isAxiosError(error) || isCancel(error)) throw error;
      const config = error.config as AuthConfig | undefined;
      if (config?.signal?.aborted) throw new CanceledError();
      const current = session.getSnapshot();
      if (!config?._sentToken || !current || config._sid !== current.sid) throw error;

      if (isAccountDisabled(error)) {
        await session.expire(current.sid);
        throw error;
      }
      if (config._retry && error.response?.status === 401) {
        logAuthEvent("auth.refresh.retry_unauthorized", { status: 401 });
      }
      if (config._retry || config.retryOnAuth === false || !shouldRefreshOn401(error)) {
        throw error;
      }

      logAuthEvent("auth.refresh.unauthorized", { status: 401 });
      config._retry = true;
      if (current.accessToken === config._sentToken) {
        try {
          await waitForRefresh(session.refreshSession(current.sid), config);
        } catch (refreshError) {
          if (refreshError instanceof SessionExpiredError) throw error;
          throw refreshError;
        }
      }

      if (config.signal?.aborted) throw new CanceledError();
      if (session.getSnapshot()?.sid !== current.sid) throw error;
      logAuthEvent("auth.refresh.retry");
      return api(config);
    },
  );
}

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
