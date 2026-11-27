export const authApiBaseUrl = process.env.EXPO_PUBLIC_AUTH_API_URL?.trim();
export const isDemoAuthEnabled = __DEV__ && !authApiBaseUrl;
