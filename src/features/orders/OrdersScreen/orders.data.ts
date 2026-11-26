import { catalogProducts } from "@/features/products/catalog.data";
import type { CatalogProduct } from "@/types/product";

export type OrderStatus =
  | "pending-payment"
  | "awaiting-shipment"
  | "awaiting-receipt"
  | "review"
  | "return";

export type OrderItem = {
  product: CatalogProduct;
  quantity: number;
};

export type DeliveryTracking = {
  courierName: string;
  courierPhone: string;
  vehicle: string;
  currentLocation: string;
  destination: string;
  eta: string;
  distance: string;
  updatedAt: string;
  driverCoordinates: { latitude: number; longitude: number };
  destinationCoordinates: { latitude: number; longitude: number };
  route: readonly { latitude: number; longitude: number }[];
};

export type CustomerOrder = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  statusLabel: string;
  statusDetail: string;
  paymentMethod: string;
  shippingAddress: string;
  total: number;
  items: readonly OrderItem[];
  tracking?: DeliveryTracking;
};

export type OrderFilter = "all" | OrderStatus;

export const orderFilters: readonly { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending-payment", label: "Chờ thanh toán" },
  { id: "awaiting-shipment", label: "Chờ vận chuyển" },
  { id: "awaiting-receipt", label: "Chờ nhận" },
  { id: "review", label: "Cần đánh giá" },
  { id: "return", label: "Trả hàng" },
];

function product(id: string): CatalogProduct {
  const item = catalogProducts.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing demo order product: ${id}`);
  return item;
}

export const demoOrders: readonly CustomerOrder[] = [
  {
    id: "OVN-261124-0821",
    placedAt: "24/11/2026 · 08:21",
    status: "pending-payment",
    statusLabel: "Chờ thanh toán",
    statusDetail: "Hoàn tất thanh toán trước 20:30 hôm nay để giữ đơn.",
    paymentMethod: "Chuyển khoản ngân hàng",
    shippingAddress: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh",
    total: 209_000,
    items: [
      { product: product("strawberries"), quantity: 1 },
      { product: product("kale"), quantity: 2 },
    ],
  },
  {
    id: "OVN-261123-1048",
    placedAt: "23/11/2026 · 10:48",
    status: "awaiting-shipment",
    statusLabel: "Chờ vận chuyển",
    statusDetail: "Nông trại đang đóng gói và bàn giao cho đơn vị vận chuyển.",
    paymentMethod: "Thanh toán khi nhận hàng",
    shippingAddress: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh",
    total: 188_000,
    items: [
      { product: product("rice"), quantity: 1 },
      { product: product("eggs"), quantity: 1 },
    ],
  },
  {
    id: "OVN-261122-1726",
    placedAt: "22/11/2026 · 17:26",
    status: "awaiting-receipt",
    statusLabel: "Đang giao",
    statusDetail: "Dự kiến giao hôm nay, 14:00–18:00. Vui lòng chú ý điện thoại.",
    paymentMethod: "Thanh toán khi nhận hàng",
    shippingAddress: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh",
    total: 143_000,
    tracking: {
      courierName: "Nguyễn Minh Khôi",
      courierPhone: "0909 246 815",
      vehicle: "Honda Wave · 59N2-481.26",
      currentLocation: "Đường Nguyễn Thị Minh Khai, Quận 3",
      destination: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa",
      eta: "Khoảng 18 phút",
      distance: "2,4 km",
      updatedAt: "Vừa cập nhật",
      driverCoordinates: { latitude: 10.7806, longitude: 106.6887 },
      destinationCoordinates: { latitude: 10.7862, longitude: 106.6982 },
      route: [
        { latitude: 10.7806, longitude: 106.6887 },
        { latitude: 10.7818, longitude: 106.6911 },
        { latitude: 10.7834, longitude: 106.6935 },
        { latitude: 10.7847, longitude: 106.6961 },
        { latitude: 10.7862, longitude: 106.6982 },
      ],
    },
    items: [
      { product: product("tomatoes"), quantity: 2 },
      { product: product("avocado"), quantity: 1 },
    ],
  },
  {
    id: "OVN-261120-0954",
    placedAt: "20/11/2026 · 09:54",
    status: "review",
    statusLabel: "Đã giao",
    statusDetail: "Đã giao thành công lúc 16:42 ngày 21/11/2026.",
    paymentMethod: "Thanh toán khi nhận hàng",
    shippingAddress: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh",
    total: 92_000,
    items: [
      { product: product("kale"), quantity: 2 },
      { product: product("mushrooms"), quantity: 1 },
    ],
  },
  {
    id: "OVN-261117-0732",
    placedAt: "17/11/2026 · 07:32",
    status: "return",
    statusLabel: "Đang xử lý trả hàng",
    statusDetail: "Yêu cầu đã được tiếp nhận. Dự kiến phản hồi trước 25/11/2026.",
    paymentMethod: "Ví điện tử",
    shippingAddress: "128 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh",
    total: 145_000,
    items: [{ product: product("strawberries"), quantity: 1 }],
  },
];

