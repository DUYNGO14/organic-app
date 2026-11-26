import { storage } from "@/lib/storage";
import { create } from "axios";
import { randomUUID } from "expo-crypto";
import { fetch as expoFetch } from "expo/fetch";
import { createAuthSession } from "./authSession";
import { createAuthTransport } from "./authTransport";
import { createTokenStorage } from "./tokenStorage";

export function getHttpsOrigin(url: string) {
  // Reject authorities the React Native URL parser cannot validate safely.
  if (!/^https:\/\/[a-z0-9.-]+(?::\d{1,5})?(?=[/?#]|$)/i.test(url) || /[\\\s]/.test(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname || parsed.username || parsed.password) return null;
    const port = Number(parsed.port || "443");
    if (port > 65535) return null;
    return `https://${parsed.hostname.toLowerCase()}${port === 443 ? "" : `:${port}`}`;
  } catch {
    return null;
  }
}

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const apiBaseUrl = configuredUrl || "https://dummyjson.com";

const configuredOrigin = configuredUrl && getHttpsOrigin(configuredUrl);
export const trustedApiOrigin =
  configuredOrigin && !/^https:\/\/(?:api\.example\.com|dummyjson\.com)(?::|$)/i.test(configuredOrigin)
    ? configuredOrigin
    : null;

const refreshClient = create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  adapter: "fetch",
  env: {
    fetch: (input, options) => expoFetch(input, { ...options, redirect: "error" }),
  },
});

const transport = createAuthTransport(refreshClient, trustedApiOrigin !== null);

export const authSession = createAuthSession(
  createTokenStorage(storage, randomUUID),
  transport.refreshTokens,
  transport.revokeSession,
);
