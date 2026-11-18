import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

/** Encrypted, async storage for small app state and sensitive session data. */
export const secureStorage: StateStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

/** Typed helpers backed by Expo SecureStore (all methods are asynchronous). */
export const storage = {
  getString: (key: string) => SecureStore.getItemAsync(key),
  setString: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  getBoolean: async (key: string) =>
    (await SecureStore.getItemAsync(key)) === "true",
  setBoolean: (key: string, value: boolean) =>
    SecureStore.setItemAsync(key, String(value)),
  getJSON: async <T>(key: string): Promise<T | null> => {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON: (key: string, value: unknown) =>
    SecureStore.setItemAsync(key, JSON.stringify(value)),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
