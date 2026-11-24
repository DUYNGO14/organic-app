import type { LucideIcon } from "lucide-react-native";
import { Apple, Carrot, Egg, Leaf, Sprout, Wheat } from "lucide-react-native";

export type HomeBanner = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  actionLabel: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  image: string | number;
};

export type HomeProduct = {
  id: string;
  name: string;
  subtitle: string;
  origin: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge: string;
  soldPercent?: number;
  rating?: string;
  reviewCount?: number;
};

const tomatoesImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQVakrDhUbzLDowKYIsoC44Af3tYB4h6b1NZv-Ru4dyXLuD3OWkEEc8jX-xicMYukqTr2Zwt8C3KiLXKU7DqOjswKUoVRxr5NjrvH9hya0ofg0saoonpBP9Cx7xY81OPffgeF5Oo4x2Cr9mZSMRtAtP5Pb2T4pAAD4Re7lkSpoWnhkZyYtU34llq__0EbAuo3kGyPqS_C_ui0XyOt9fHEcRhMLlhx57F0Jph-KMC8";

const eggsImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBl57Bdt8zIGaaTjhDTex3vftiPiNaohQVXqby4QJeNV_ccqr9lxRkmF59pLfEo9D_EghHD1sJMEcsJyfm3pB1q2K7gK_5im6VU1igsuPVnZgyf7oRxpwgdokoHXZYwSTUR0-pl7p9y7dvFXj0yBlpFHtdBmvJ705XcXqt3umhUZptGHCDtyFUo2cCVYhCaHgSNfInyqx3_HJdRNaw1kb6JbhEHT8lacXMv3bi9eEg";

const riceImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDXrUd1PSdH22wJKdyyUGxNURtWZOtnUTjYVbfltNWNt6nXz27RWU8FHeYWysNsZaQ8I336fBZ9cJ7rIBCiFy3TzaXJKgQ1aYwx5lr-eoFEuhc7qQ6dZRWUdF-qAhcYnlBVaWrTZSJJ_-mRFNHm0N6wf3I2HiayD4jn0OdgDowIPVueAgtVlXWv_jtyI42akdTYxUtHZHYFwmza3r0K2JZfKNBaY5b-iNhMWpnDJd0";

export const homeBanners: HomeBanner[] = [
  {
    id: "harvest",
    eyebrow: "100% thuần khiết • VietGAP & USDA",
    title: "Mùa vụ mới: Hái sớm từ Đà Lạt",
    description: "Giảm ngay 25% đơn đầu tiên. Nhập mã ORGANICVIET",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKQcyieg87ITzTbparvQWNaSBbVHOJHopCOPdqs8ip-_Pu_zXO40poAfuhNnmMih5H5IvZo0-WoNIUDHaKS6mzyetvbkVTSWfIJdenZ8lIqk_l5Znhnqk4oK2Uz9bC3r5Cyc61QUYFD67aaUX85qrviHDBO6jRTWfGOf3nss3QKTViveXPDZ9bdOA0w6g-GkqvfPntBoYafm5FDUg5RwYIbyOll3nYoSfcYQMBwzY",
    actionLabel: "Khám phá ngay",
  },
  {
    id: "traceability",
    eyebrow: "Mỗi sản phẩm đều có câu chuyện",
    title: "Biết rõ nông trại, an tâm mỗi bữa ăn",
    description: "Quét mã QR để xem nhật ký canh tác và ngày thu hoạch.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9dsDkQYGVSrsNYRLV1FibXi2AAwtlXwyljsUDZQGke6Tfqaf2bmM4i7Yx9HiiX-62MVn8sVVNuOMcLDodbXqIOqC77Ll7LdVUinAIbaLhBr7ZX6o9145OUtK1mQf9_lhRRj8Sl8ek20gzujr6YBxtUStY3foMb4c5h42P2q0ztA6Vo4fa9ZYdyp4H3e6MztsVpEOQss10XjKwuiykQ3aG5bl34N4CXUEcwkjMXGo",
    actionLabel: "Xem nông trại",
  },
  {
    id: "fresh",
    eyebrow: "Tươi ngon mỗi ngày",
    title: "Thu hoạch buổi sáng, giao đến tận nhà",
    description: "Rau củ theo mùa được chọn lọc từ các nông trại địa phương.",
    image: tomatoesImage,
    actionLabel: "Xem sản phẩm",
  },
];

export const homeCategories: HomeCategory[] = [
  {
    id: "greens",
    title: "Rau lá xanh",
    subtitle: "Cải Kale, xà lách",
    Icon: Leaf,
    image: require("@/assets/images/farm/kale.jpg"),
  },
  {
    id: "fruit",
    title: "Trái cây sạch",
    subtitle: "Bơ sáp, cam ngọt",
    Icon: Apple,
    image: require("@/assets/images/farm/strawberries.jpg"),
  },
  {
    id: "roots",
    title: "Củ quả tươi",
    subtitle: "Cà chua, cà rốt",
    Icon: Carrot,
    image: tomatoesImage,
  },
  {
    id: "eggs",
    title: "Trứng & sữa",
    subtitle: "Gà ta, sữa hạt",
    Icon: Egg,
    image: eggsImage,
  },
  {
    id: "grains",
    title: "Gạo hữu cơ",
    subtitle: "ST25 lúa tôm",
    Icon: Wheat,
    image: riceImage,
  },
  {
    id: "farms",
    title: "Nông trại",
    subtitle: "Nhật ký vườn",
    Icon: Sprout,
    image: require("@/assets/images/farm/greenhouse.jpg"),
  },
];

export const dealProducts: HomeProduct[] = [
  {
    id: "kale",
    name: "Cải Kale Thủy Canh",
    subtitle: "Túi sinh học 300g",
    origin: "VietGAP • Đà Lạt",
    price: 32_000,
    oldPrice: 45_000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDykkbF26NvhK3_oOx_6C6Ge5XUdtEvspJzE2IqsbMV9sxiKH5fCnw4HTcMlhX7TUDEAje-T3r_5zT3OIXsRrvlzZ3XiK7CJb8kfPidleYbIA5XdWJR87sY16ATkb37spBtfagDasUHSSAMQNIGSsU8gIb1stqDNnveqmafE_soQmlkuVOG6v-k2f_PUaSRjzxtNpw--ezPxNm5pM9MaS_VVH7FvDLf7sQlcDDlWgk",
    badge: "Hái 05:00 sáng",
    soldPercent: 86,
  },
  {
    id: "strawberries",
    name: "Dâu Tây Hana Loại 1",
    subtitle: "Hộp giấy 500g",
    origin: "Mộc Châu Eco",
    price: 145_000,
    oldPrice: 180_000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGAaroUVf33coPAsGUApO-saC8lgCnFf4OXU52XSpVASF8wPQI5xtlWKXkPSMkvcxDb_WtGWiAsfISKwAzcG6er4bIzQe0b2G9gfB0ISBVObLdrzwQkL9k1vh5GlZAR2DIz3kqbk3NmZxZgKmhhVSBl5EUjR_SoquL1CR4hkcI96-jEVkJs0OrK490WyYKQUyFHGsWJKS0wYIoc5KT1vlyuEbw2lAxVosXJCUthcI",
    badge: "GlobalGAP",
    soldPercent: 62,
  },
  {
    id: "tomatoes",
    name: "Cà Chua Bi Cherry",
    subtitle: "Hộp giấy 400g",
    origin: "VietGAP • Đà Lạt",
    price: 39_000,
    oldPrice: 52_000,
    image: tomatoesImage,
    badge: "Thu hoạch hôm nay",
    soldPercent: 74,
  },
];

export const recommendedProducts: HomeProduct[] = [
  {
    id: "avocado",
    name: "Bơ Sáp Đắk Lắk Dẻo",
    subtitle: "Trọng lượng 1kg (Loại 1)",
    origin: "VietGAP",
    price: 65_000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoJ5bvVRKNhaml3G9ct-EzXyO9a3iiKdx8uBWFagF8NO85wbPe7gI6eQPbdRgnYrNbr4Kuf2UaTdaV2rYOT_UoETbhf9N3g7VHoslwQM4NV2WIIC9hKtSuuFRDnr07KbuHFEklvdzrjN1XptLLYCEEqO6B1gZT6GEvfx5qOqohdSbTDUlf8eA7QfkVcRrCvXyBsPoXv8A1CuH2oN2CqDV-QaOBnvwdub5ve4GX1iE",
    badge: "VietGAP",
    rating: "4.9",
    reviewCount: 128,
  },
  {
    id: "eggs",
    name: "Trứng Gà Nuôi Thảo Mộc",
    subtitle: "Hộp giấy 10 quả",
    origin: "Thảo mộc",
    price: 48_000,
    image: eggsImage,
    badge: "Thảo mộc",
    rating: "5.0",
    reviewCount: 94,
  },
  {
    id: "mushrooms",
    name: "Nấm Đùi Gà Hữu Cơ",
    subtitle: "Khay 250g tươi mới",
    origin: "Organic",
    price: 28_000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAd0ko1ppm-H0apnp_0mLqx5IGU10sx-ttt68eXo4bi9VmufTR6hCrQUkoA7GLbZG72muyw3PQCpZCajalVVe8QJ1gL9nlwPLimjJ7EELDsgFuR3he70AXm_rLOrFYWL8wmm9z6IW_gAGcNQZXUn7c-u7aTKB9oC6HnMgA-bqiplONnSIzLmxKpuN9vn6Cwe18j-iYdoHb_QNxhlJs0MASlxNTweY45XtKAlYH1jXA",
    badge: "Organic",
    rating: "4.8",
    reviewCount: 56,
  },
  {
    id: "rice",
    name: "Gạo ST25 Hữu Cơ Lúa Tôm",
    subtitle: "Túi hút chân không 2kg",
    origin: "USDA Organic",
    price: 115_000,
    image: riceImage,
    badge: "USDA Organic",
    rating: "5.0",
    reviewCount: 312,
  },
];

export const farmStoryImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC9dsDkQYGVSrsNYRLV1FibXi2AAwtlXwyljsUDZQGke6Tfqaf2bmM4i7Yx9HiiX-62MVn8sVVNuOMcLDodbXqIOqC77Ll7LdVUinAIbaLhBr7ZX6o9145OUtK1mQf9_lhRRj8Sl8ek20gzujr6YBxtUStY3foMb4c5h42P2q0ztA6Vo4fa9ZYdyp4H3e6MztsVpEOQss10XjKwuiykQ3aG5bl34N4CXUEcwkjMXGo";
