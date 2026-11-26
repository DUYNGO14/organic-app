export type User = Record<string, unknown> & { phone?: string };

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  phone?: string;
  userData?: User;
};
