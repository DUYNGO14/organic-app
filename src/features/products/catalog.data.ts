import { dealProducts, recommendedProducts } from "@/features/home/home.data";
import type { CatalogProduct, Product, ProductCategoryId } from "@/types/product";
import type { LucideIcon } from "lucide-react-native";
import {
  Apple,
  Carrot,
  Egg,
  Flower2,
  Leaf,
  Sprout,
  Wheat,
} from "lucide-react-native";

export type ProductCategory = {
  id: ProductCategoryId;
  label: string;
  count: number;
  Icon: LucideIcon;
};

export const productCategories: ProductCategory[] = [
  { id: "greens", label: "Rau lá xanh", count: 24, Icon: Leaf },
  { id: "fruit", label: "Trái cây tươi", count: 18, Icon: Apple },
  { id: "roots", label: "Củ quả sạch", count: 15, Icon: Carrot },
  { id: "eggs", label: "Trứng & sữa", count: 8, Icon: Egg },
  { id: "mushrooms", label: "Nấm & mầm", count: 12, Icon: Sprout },
  { id: "grains", label: "Gạo ngũ cốc", count: 10, Icon: Wheat },
  { id: "herbs", label: "Gia vị mộc", count: 9, Icon: Flower2 },
];

const homeProductById = new Map(
  [...dealProducts, ...recommendedProducts].map((product) => [product.id, product]),
);

function getHomeProduct(id: string): Product {
  const product = homeProductById.get(id);
  if (!product) throw new Error(`Missing home demo product: ${id}`);
  return product;
}

const greenImages = {
  lettuce:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD7_MvyH3_cxJI8aWQOJKtUn8px4pfrnkdVdBmqephvH7K7zGRAy2ybjgJo-Zitt8PHulFxTVhMedbG2jX7ySVr3_gdy2oa8_zxy2_wLE-qyY7WMZ5dNY8Nokka33CCxtrDqjxh3XMIQ7fdBQtH90dHmoOsdfFzZQTBoAaI20vknQiWeKT_1ygAOSAnpCnKHrer2zAtKLZ_7yE_hTWpIKgjbjlIVjMqO7lIifyWq24",
  spinach:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBX0-a96ZraauxrOFJZuByq2IpoPfWh1tUUgnuXoeiBzD5tI9We7sP1BJqT9BHUCJ3QV7edj-5QHFo5PUhFMw-oNeUrmHQKcLc60dhmiMhis-MuOG-LGZzF1lA0rdvOFstbp2wP86kftA8zaTphnoYQJzFfQKUij_coNj5PDPzErEkKbwm4mpsM7_KqqiveKWFAVQ05pW9dONe-yEirYIqz3ROru-QCqM-WjD98V4",
  mustard:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwh-LLg3AyeitGJSC3BXcimRc5ps5DtRUIDBY1bk5vdxH5xFJ8lzWc4OHmQl5qIdL1VYJxmT_LluXqgqbTUafSbxmdfyfRlCsKPRf31Fbaou0Fn0LYT4n2VTHwLB0tz3s__ijLWkv2aS3FfN-SP8kTx1f4wLAu4JCcCvpqb3A5cGU_eA_dzp8Re3oeJlTDnZCYTNlErY4vRtoi2y5U4MI8Mq-4tZTwCTWNccy_kqs",
  sprouts:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAjXVRTIEe1Sh-BcKVdLxzKkNMOBBeSmafDQgpGrkkHIMUFeYZ9lAKLQSWacPWRDtMzx-m2oGnFX1VjvLbgyxvwuY-pplZZVt0kHZCeuPhVH-uKEz5Bi7AoifdL8hMHRVmB1kMtFP9g056xIA56wEtb6evAh4ClkBdQrfsWo-c1zAXe_BiypA6NHjapz0lYTASHh0D23PSygQp2kxgZvt0asDaoJho4psLNydDV6IM",
  cabbage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA6FcHwXowvY-Be3vD_fuLxWNMd5YqVDtn5LKb6ckI9IjXW5GRDh2vutjDPGmTxUHd0w-xFQAiOOuip_GIDwc_ESLsdmk6SEafHbN0NEfCoJXLpwt2VzUJihqu4kUCbllskMXlEylYKlZL3Y7QcOWTkoeHN9sRfuHUd8okWWQSF1lpK-ESVcn2hza-b2FMZL_HV31-vQ3GYa_WCkPBXM1r7t44c7vBcPsWfLgN1zIY",
} as const;

function withMetadata(
  product: Product,
  metadata: Omit<CatalogProduct, keyof Product>,
): CatalogProduct {
  return { ...product, ...metadata };
}

const baseProducts: CatalogProduct[] = [
  withMetadata(getHomeProduct("kale"), {
    categoryIds: ["greens"],
    bottomLabel: "05:00 sáng",
    seasonTags: ["in-season", "early-harvest"],
    harvestOrder: 7,
  }),
  withMetadata(getHomeProduct("strawberries"), {
    categoryIds: ["fruit"],
    seasonTags: ["in-season", "cold-region"],
    harvestOrder: 4,
  }),
  withMetadata(getHomeProduct("tomatoes"), {
    categoryIds: ["roots"],
    seasonTags: ["in-season", "early-harvest"],
    harvestOrder: 6,
  }),
  withMetadata(getHomeProduct("avocado"), {
    categoryIds: ["fruit"],
    seasonTags: ["in-season"],
    harvestOrder: 3,
  }),
  withMetadata(getHomeProduct("eggs"), {
    categoryIds: ["eggs"],
    seasonTags: [],
    harvestOrder: 2,
  }),
  withMetadata(getHomeProduct("mushrooms"), {
    categoryIds: ["mushrooms"],
    seasonTags: ["cold-region"],
    harvestOrder: 5,
  }),
  withMetadata(getHomeProduct("rice"), {
    categoryIds: ["grains"],
    seasonTags: [],
    harvestOrder: 1,
  }),
];

const featuredGreenProducts: CatalogProduct[] = [
  {
    id: "lettuce-lollo",
    name: "Xà Lách Lô Lô Xanh",
    subtitle: "Hữu cơ • 250g",
    origin: "Vườn Mộc",
    price: 24_000,
    oldPrice: 28_000,
    image: greenImages.lettuce,
    badge: "Vào mùa ngọt",
    bottomLabel: "Vào mùa ngọt",
    categoryIds: ["greens"],
    seasonTags: ["in-season", "cold-region"],
    harvestOrder: 6,
  },
  {
    id: "spinach",
    name: "Cải Bó Xôi Sinh Thái",
    subtitle: "Sinh thái • 300g",
    origin: "Lạc Dương",
    price: 35_000,
    image: greenImages.spinach,
    badge: "USDA Organic",
    certification: "USDA Organic",
    bottomLabel: "Sinh thái Lạc Dương",
    categoryIds: ["greens"],
    seasonTags: ["in-season", "cold-region", "early-harvest"],
    harvestOrder: 5,
  },
  {
    id: "mustard-greens",
    name: "Cải Bẹ Xanh Mộc",
    subtitle: "Vườn Mộc • 500g",
    origin: "Vườn Mộc",
    price: 18_000,
    image: greenImages.mustard,
    badge: "Vi sinh",
    topLabel: "Vi sinh",
    bottomLabel: "Vườn Mộc 05:30",
    categoryIds: ["greens"],
    seasonTags: ["in-season", "early-harvest"],
    harvestOrder: 4,
  },
  {
    id: "radish-sprouts",
    name: "Rau Mầm Cải Củ",
    subtitle: "Khay giấy • 200g",
    origin: "Nông trại hữu cơ",
    price: 22_000,
    image: greenImages.sprouts,
    badge: "Tươi 24h",
    topLabel: "Tươi 24h",
    bottomLabel: "Khay giấy Eco",
    categoryIds: ["greens", "mushrooms"],
    seasonTags: ["in-season", "early-harvest"],
    harvestOrder: 7,
  },
  {
    id: "heart-cabbage",
    name: "Bắp Cải Trái Tim",
    subtitle: "Đà Lạt • 800g",
    origin: "Đà Lạt Mộng Mơ",
    price: 28_000,
    image: greenImages.cabbage,
    badge: "Đặc sản",
    topLabel: "Đặc sản",
    bottomLabel: "Đà Lạt Mộng Mơ",
    categoryIds: ["greens"],
    seasonTags: ["in-season", "cold-region"],
    harvestOrder: 3,
  },
];

const herbProduct: CatalogProduct = {
  id: "fresh-basil",
  name: "Húng Quế Hữu Cơ",
  subtitle: "Bó tươi • 100g",
  origin: "Vườn Mộc",
  price: 16_000,
  image: greenImages.mustard,
  badge: "Organic",
  certification: "Organic",
  bottomLabel: "Thu hoạch sáng nay",
  categoryIds: ["herbs"],
  seasonTags: ["in-season", "early-harvest"],
  harvestOrder: 8,
};

export const catalogProducts: CatalogProduct[] = [
  ...baseProducts,
  ...featuredGreenProducts,
  herbProduct,
];
