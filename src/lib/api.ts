/* eslint-disable import/no-unresolved */
import { env } from "@/config/env";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "@/utils/token";
import { AxiosError, create, InternalAxiosRequestConfig } from "axios";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const log = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

if (!env.EXPO_PUBLIC_API_URL) {
  console.warn(
    "[API] EXPO_PUBLIC_API_URL is not set. Please check your environment variables.",
  );
}

const api = create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Instance riêng, KHÔNG gắn interceptor, dùng cho gọi refresh
const authClient = create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Logout callback: App đăng ký để điều hướng về Login, xóa store, xóa cache
// ---------------------------------------------------------------------------
let onLogout: (() => void) | null = null;
export const setOnLogout = (fn: () => void) => {
  onLogout = fn;
};

// Chặn onLogout bị gọi nhiều lần khi nhiều request song song cùng lỗi
let loggingOut = false;
// Gọi sau khi đăng nhập thành công
export const resetLogoutFlag = () => {
  loggingOut = false;
};

// Các endpoint không được thử refresh khi gặp 401
const SKIP_REFRESH = ["/auth/login", "/auth/login/refreshToken"];

// ---------------------------------------------------------------------------
// Request interceptor: gắn access token nếu có (khách thì không có)
// ---------------------------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  log("[API]", config.method?.toUpperCase(), config.url); // không log body/token
  return config;
});

// ---------------------------------------------------------------------------
// Refresh token (dùng chung một promise cho mọi request đang chờ)
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await authClient.post("/auth/login/refreshToken", {
    refreshToken,
  });
  const access = data?.data?.accessToken ?? data?.accessToken;
  const refresh = data?.data?.refreshToken ?? data?.refreshToken;
  if (!access) throw new Error("Refresh did not return access token");

  await saveAccessToken(access);
  if (refresh) await saveRefreshToken(refresh);
  return access;
};

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    const isSkipUrl = SKIP_REFRESH.some((p) => original?.url?.endsWith(p));
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isSkipUrl
    ) {
      return Promise.reject(error);
    }
    original._retry = true;

    // Khách (chưa đăng nhập): không có phiên để refresh.
    // Trả nguyên lỗi 401 để màn hình tự hiện "Vui lòng đăng nhập".
    if (!(await getRefreshToken())) {
      return Promise.reject(error);
    }

    try {
      // Nếu token trong storage đã khác token request này dùng
      // => đã có lần refresh xong trước đó, chỉ cần retry, không refresh nữa
      const sent = String(original.headers?.Authorization ?? "").replace(
        "Bearer ",
        "",
      );
      const current = await getAccessToken();

      let newToken: string;
      if (current && current !== sent) {
        newToken = current;
      } else {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        newToken = await refreshPromise;
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      const err = e as AxiosError;
      // Chỉ logout khi server từ chối refresh token (hết phiên) hoặc
      // refresh token biến mất giữa chừng. Lỗi mạng (không có response)
      // thì giữ phiên.
      const sessionExpired =
        !!err.response || err.message === "No refresh token";
      if (sessionExpired && !loggingOut) {
        loggingOut = true;
        await clearTokens();
        onLogout?.();
      }
      return Promise.reject(e);
    }
  },
);

export default api;
