// Gom QueryClient, SafeArea, Gesture...
import { AppToast } from "@/components/common/AppToast";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/providers/theme-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          <AppToast />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
