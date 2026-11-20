import type { PropsWithChildren } from "react";
import { View } from "react-native";

type DetailCardProps = PropsWithChildren<{ className?: string }>;

export function DetailCard({ children, className = "" }: DetailCardProps) {
  return (
    <View className={`rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest p-4 shadow-sm dark:border-[#00E676]/[0.12] ${className}`}>
      {children}
    </View>
  );
}
