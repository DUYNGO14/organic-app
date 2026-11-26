import type { AxiosInstance } from "axios";
import { hasToken, type Tokens } from "./tokenStorage";

export function createAuthTransport(client: AxiosInstance, enabled: boolean) {
  return {
    async refreshTokens(refreshToken: string): Promise<Tokens> {
      if (!enabled) throw new Error("Chưa cấu hình máy chủ xác thực.");
      const { data } = await client.post<{
        success?: unknown;
        data?: { accessToken?: unknown; refreshToken?: unknown };
      }>("/auth/login/refreshToken", { refreshToken });

      if (
        data?.success !== true ||
        !hasToken(data.data?.accessToken) ||
        (data.data.refreshToken !== undefined && !hasToken(data.data.refreshToken))
      ) {
        throw new Error("Phản hồi làm mới phiên không hợp lệ.");
      }

      return {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken ?? refreshToken,
      };
    },

    async revokeSession(refreshToken: string) {
      if (enabled) {
        await client.post("/auth/logout", { refreshToken }, { timeout: 3_000 });
      }
    },
  };
}
