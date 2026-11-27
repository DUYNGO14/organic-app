import { storage } from "@/lib/storage";

// Key của SecureStore chỉ cho phép chữ, số, ".", "-", "_"
const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

// undefined = chưa đọc từ SecureStore, null = đã đọc và không có
let accessCache: string | null | undefined;
let refreshCache: string | null | undefined;

export const getAccessToken = async (): Promise<string | null> => {
  if (accessCache === undefined)
    accessCache = await storage.getString(ACCESS_KEY);
  return accessCache;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (refreshCache === undefined)
    refreshCache = await storage.getString(REFRESH_KEY);
  return refreshCache;
};

export const saveAccessToken = async (token: string) => {
  accessCache = token;
  await storage.setString(ACCESS_KEY, token);
};

export const saveRefreshToken = async (token: string) => {
  refreshCache = token;
  await storage.setString(REFRESH_KEY, token);
};

export const saveTokens = async (access: string, refresh?: string | null) => {
  await saveAccessToken(access);
  if (refresh) await saveRefreshToken(refresh);
};

export const clearTokens = async () => {
  accessCache = null;
  refreshCache = null;
  await Promise.all([storage.remove(ACCESS_KEY), storage.remove(REFRESH_KEY)]);
};
