import { dealProducts, homeBanners } from "@/features/home/home.data";
import type { LucideIcon } from "lucide-react-native";
import {
  BellRing,
  ClipboardList,
  Leaf,
  MapPinHouse,
  PackageCheck,
  QrCode,
  Recycle,
  ScanLine,
  ShieldCheck,
  Sprout,
  Tractor,
  WalletCards,
} from "lucide-react-native";

export const PROFILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBnRUjP0qO3tNOPcNjl47A1IGFPy3ox4mXkdGW2JqSLyD0HeO3vofbFDtKMaiTzmIlCyNMG8cre7H_D1oa27UPZXKtF_0bQK41V8sfkeOEup6_vvmWPSfjpC50lRAG19RDgxLBd7LPZeR9-cyug60W2WUzeJxrAad60ryN0T3o6xFcvc3FwvJP_HGqk1IivqcAoY9Cp4yLkCsolJz5TDGrRnF0SyEhL3MWVcWLzYU";

export type ProfileImpact = {
  id: string;
  value: string;
  unit: string;
  label: string;
  Icon: LucideIcon;
};

export const profileImpacts: readonly ProfileImpact[] = [
  { id: "plastic", value: "3,8", unit: "kg", label: "Nhựa giảm thải ra đại dương", Icon: Recycle },
  { id: "harvest", value: "18", unit: "lần", label: "Hái sớm trợ lực nông hộ sạch", Icon: Sprout },
  { id: "packaging", value: "100", unit: "%", label: "Bao bì bã mía tự phân hủy", Icon: PackageCheck },
];

export type GreenReward = {
  id: string;
  title: string;
  description: string;
  badge: string;
  points: number;
  image: string;
};

export const greenRewards: readonly GreenReward[] = [
  {
    id: "vegetable-voucher",
    title: "Voucher 50.000đ đơn rau",
    description: "Áp dụng cho giỏ nông sản từ 250.000đ.",
    badge: "Giảm trực tiếp",
    points: 500,
    image: homeBanners[2].image,
  },
  {
    id: "season-gift",
    title: "Giỏ quà nông sản Đà Lạt",
    description: "Dâu Hana và nông sản cao nguyên hữu cơ.",
    badge: "Quà tặng vụ mùa",
    points: 1_000,
    image: dealProducts[1].image,
  },
  {
    id: "herb-seedling",
    title: "Tặng cây gia vị mầm",
    description: "Chọn Hương Thảo hoặc Húng Quế Tây.",
    badge: "Trồng tại nhà",
    points: 300,
    image: dealProducts[0].image,
  },
];

export type ProfileShortcut = {
  id: "orders" | "addresses" | "farms" | "wallet";
  title: string;
  subtitle: string;
  Icon: LucideIcon;
};

export const profileShortcuts: readonly ProfileShortcut[] = [
  { id: "orders", title: "Đơn mua gần đây", subtitle: "1 đơn đang đóng gói", Icon: ClipboardList },
  { id: "addresses", title: "Sổ địa chỉ xanh", subtitle: "2 địa chỉ nhận rau", Icon: MapPinHouse },
  { id: "farms", title: "Nông trại yêu thích", subtitle: "Đang theo dõi 4 HTX", Icon: Tractor },
  { id: "wallet", title: "Ví & Thanh toán", subtitle: "VietQR / Apple Pay", Icon: WalletCards },
];

export type ProfileSetting = {
  id: "traceability" | "notifications" | "policy";
  title: string;
  subtitle: string;
  Icon: LucideIcon;
};

export const profileSettings: readonly ProfileSetting[] = [
  {
    id: "traceability",
    title: "Nhật ký truy xuất & mã QR đã quét",
    subtitle: "Lịch sử kiểm tra nguồn gốc rau củ",
    Icon: ScanLine,
  },
  {
    id: "notifications",
    title: "Thông báo mùa vụ nông sản mới",
    subtitle: "Nhận tin khi có đợt thu hoạch mới",
    Icon: BellRing,
  },
  {
    id: "policy",
    title: "Trung tâm pháp lý & quyền riêng tư",
    subtitle: "Điều khoản, bảo mật dữ liệu và chính sách đổi trả",
    Icon: ShieldCheck,
  },
];

export const pointHistory = [
  { id: "order", title: "Mua đơn #OVN-261122-1726", date: "22/11/2026", points: 120, Icon: Leaf },
  { id: "scan", title: "Quét mã truy xuất nguồn gốc", date: "18/11/2026", points: 20, Icon: QrCode },
  { id: "redeem", title: "Đổi voucher rau hữu cơ", date: "12/11/2026", points: -500, Icon: WalletCards },
] as const;

export const followedFarms = [
  {
    id: "highland",
    name: "HTX Cao Nguyên Xanh",
    status: "Mùa Cải Kale mới thu",
    image: require("@/assets/images/farm/greenhouse.jpg"),
  },
  {
    id: "hana",
    name: "Vườn Dâu Hana",
    status: "Bắt đầu hái sớm",
    image: require("@/assets/images/farm/strawberries.jpg"),
  },
] as const;
