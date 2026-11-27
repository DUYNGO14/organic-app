export type User = Record<string, unknown> & {
  email?: string;
  name?: string;
  phone?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  phone?: string;
  userData?: User;
};
