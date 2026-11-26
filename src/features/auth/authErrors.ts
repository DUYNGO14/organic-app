import type { ApiError } from "@/types/api";
import { isAxiosError } from "axios";

function getAuthError(error: unknown) {
  const response = isAxiosError<Partial<ApiError>>(error) ? error.response : undefined;
  return { status: response?.status, code: response?.data?.errorCode };
}

export function shouldRefreshOn401(error: unknown) {
  const { status, code } = getAuthError(error);
  return status === 401 &&
    (code === undefined || code === "ACCESS_TOKEN_EXPIRED" || code === "ACCESS_TOKEN_INVALID");
}

export function isRefreshRejected(error: unknown) {
  const { status, code } = getAuthError(error);
  if (code === undefined) return status === 401 || status === 403;
  return status === 401 && (
    code === "REFRESH_TOKEN_EXPIRED" ||
    code === "REFRESH_TOKEN_INVALID" ||
    code === "REFRESH_TOKEN_REVOKED" ||
    code === "REFRESH_TOKEN_REUSED"
  );
}

export function isAccountDisabled(error: unknown) {
  const { status, code } = getAuthError(error);
  return status === 403 && code === "ACCOUNT_DISABLED";
}
