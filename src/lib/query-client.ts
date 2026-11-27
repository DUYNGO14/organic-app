import { i18n } from "@/localization";
import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import * as Network from "expo-network";
import { Alert, AppState, Platform } from "react-native";

/* Refetch khi app quay lại foreground (RN không có window focus) */
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) =>
    handleFocus(state === "active"),
  );
  return () => sub.remove();
});

/* Biết online/offline để tạm dừng và chạy lại request đúng lúc */
onlineManager.setEventListener((setOnline) => {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(window.navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }

  const sub = Network.addNetworkStateListener((state) =>
    setOnline(!!state.isConnected),
  );
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true, // = quay lại foreground nhờ focusManager ở trên
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Lỗi 4xx (sai dữ liệu, chưa đăng nhập, không tìm thấy): không retry
        if (isAxiosError(error) && error.response) {
          const { status } = error.response;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.silent) return;
      Alert.alert(i18n.t("common.genericErrorTitle"));
    },
  }),
});
