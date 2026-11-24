import { secureStorage } from "@/lib/storage";
import type { Href } from "expo-router";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NotificationKind = "shopping" | "traceability" | "orders";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: Href;
};

export const notifications: readonly AppNotification[] = [
  {
    id: "welcome-catalog",
    kind: "shopping",
    title: "Khám phá nông sản theo mùa",
    body: "Xem danh mục, lọc theo mùa vụ và chọn sản phẩm cho bữa ăn hôm nay.",
    href: "/(tabs)/categories",
  },
  {
    id: "welcome-traceability",
    kind: "traceability",
    title: "Tìm hiểu nguồn gốc sản phẩm",
    body: "Quét mã QR trên bao bì để xem thông tin sản phẩm và nguồn gốc.",
    href: "/scan-qr",
  },
  {
    id: "welcome-orders",
    kind: "orders",
    title: "Theo dõi đơn hàng của bạn",
    body: "Mở mục Đơn hàng để xem trạng thái giao hàng và đánh giá sau khi nhận.",
    href: "/(tabs)/orders",
  },
];

type NotificationState = {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (id) =>
        set((state) => state.readIds.includes(id) ? state : { readIds: [...state.readIds, id] }),
      markAllRead: () => set(({ readIds }) => ({
        readIds: [...new Set([...readIds, ...notifications.map(({ id }) => id)])],
      })),
    }),
    {
      name: "organic-notification-read-ids",
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ readIds }) => ({ readIds }),
      merge: (persisted, current) => {
        const savedIds = (persisted as Partial<NotificationState> | undefined)?.readIds;
        return {
          ...current,
          readIds: [...new Set([...(Array.isArray(savedIds) ? savedIds : []), ...current.readIds])],
        };
      },
    },
  ),
);

export function selectUnreadNotificationCount({ readIds }: NotificationState) {
  return notifications.filter(({ id }) => !readIds.includes(id)).length;
}
