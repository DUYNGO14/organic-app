import type { PackageOption, Product } from "@/types/product";

export type NutritionItem = {
  value: string;
  title: string;
  note: string;
};

export type ProductDetailSpec = {
  gallery: string[];
  packages: PackageOption[];
  nutrition: NutritionItem[];
  highlight: string;
  farmName: string;
  location: string;
  harvestTime: string;
};

const kaleGallery = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDn7n9GDMqCxi1OsZqk-wQihIvB1DfvHpoWFESQLEqxPkmQxba-uYaWI9bxsbbeMS4z5toQ1k7Jr4xbF4aAg8B3HlS1QVRffXlVOZlCmjCnZDyk1dmfq3IYmzDBdItU0ovSSKGTfkixmxIia9mKIOvO4WMpsXZ0G4XZyOBOySZr7q9bXHFgzHG8zc2lh3U0ZxTcg1XWS-2z8sMJjTDZ6f20K1qzavA-2FRbVqeF0WI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBHnM8bQ-KyrORn9mbNm9L0APxcSdtoR3Hc9qSu_9UnEe2epV1e_HDa4jyZ0TGcKE5AJeb8dfF52QwhwT-di8IyM_-a2FQ-AOwa6Bpa0z1OgUGDxSePANrUtq_w2_-OyYUb_SM-SS_4BojidjbFSYJftwIyOJ3J9M0X40MiuJhxqDopEpemPqIb84TmQPtgTbbOphPcEMruuhkCT4yHp1QUkdPpXJk0GzllFW8ZBCY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiron7MCZfBXaf926UA4YTr69Sxi9qsEMZCo0_f0dwnHJSegwDC1IQ0y5hU54aGV-8vGjadk2Re59EOW4FN82C44D7wEi5t08Q9n6e_q27Cw3zCkWSviT4CB7xSNXpOR3AJ0hQ8XtCCrQvuEc2jjbd7p0Lh2wF90PRBz5ZIQ5eiBGaQiKpsKunwc1N_KvKNUrVLEPMKR2-Lr9z3JZyIs67uqwn5qf1PUMtJZQpZRM",
];

const specs: Record<string, Omit<ProductDetailSpec, "gallery"> & { gallery?: string[] }> = {
  kale: {
    packages: [
      { label: "300g", price: 32_000, oldPrice: 45_000, note: "Gia đình nhỏ" },
      { label: "500g", price: 48_000, note: "3–4 bữa ăn" },
      { label: "1 kg", price: 89_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "684%", title: "Vitamin K", note: "Nhu cầu thiết yếu mỗi ngày" },
      { value: "206%", title: "Vitamin A & C", note: "Chống oxy hóa, tăng đề kháng" },
    ],
    highlight: "Giàu Sulforaphane và Lutein, hỗ trợ chế độ ăn cân bằng và bổ sung chất chống oxy hóa tự nhiên.",
    farmName: "Hợp tác xã Nông sản Xanh Lạc Dương",
    location: "Lạc Dương, Lâm Đồng · độ cao 1.500m",
    harvestTime: "05:14 hôm nay",
    gallery: kaleGallery,
  },
  strawberries: {
    packages: [
      { label: "250g", price: 79_000, note: "Ăn thử" },
      { label: "500g", price: 145_000, oldPrice: 180_000, note: "Hộp tiêu chuẩn" },
      { label: "1 kg", price: 275_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "98%", title: "Vitamin C", note: "Nhu cầu thiết yếu mỗi ngày" },
      { value: "32 kcal", title: "Năng lượng", note: "Trong mỗi 100g" },
    ],
    highlight: "Dâu tây chín tự nhiên, vị ngọt dịu và thơm; ngon khi ăn tươi hoặc dùng cùng sữa chua.",
    farmName: "Nông trại Mộc Châu Eco",
    location: "Mộc Châu, Sơn La",
    harvestTime: "06:00 hôm nay",
  },
  tomatoes: {
    packages: [
      { label: "400g", price: 39_000, oldPrice: 52_000, note: "Hộp tiêu chuẩn" },
      { label: "800g", price: 75_000, note: "Gia đình" },
      { label: "1 kg", price: 90_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "28%", title: "Vitamin C", note: "Nhu cầu thiết yếu mỗi ngày" },
      { value: "Lycopene", title: "Chất chống oxy hóa", note: "Có trong cà chua chín" },
    ],
    highlight: "Cà chua bi mọng nước, có thể dùng ăn tươi, trộn salad hoặc chế biến món ăn hằng ngày.",
    farmName: "Nông trại VietGAP Đà Lạt",
    location: "Đà Lạt, Lâm Đồng",
    harvestTime: "05:30 hôm nay",
  },
  avocado: {
    packages: [
      { label: "500g", price: 35_000, note: "Ăn thử" },
      { label: "1 kg", price: 65_000, note: "Loại 1" },
      { label: "2 kg", price: 125_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "Healthy", title: "Chất béo tốt", note: "Nguồn năng lượng tự nhiên" },
      { value: "Vitamin E", title: "Dưỡng chất", note: "Phù hợp chế độ ăn cân bằng" },
    ],
    highlight: "Bơ sáp dẻo, béo nhẹ, thích hợp ăn trực tiếp, làm sinh tố hoặc dùng trong món salad.",
    farmName: "Hợp tác xã Bơ Đắk Lắk",
    location: "Buôn Ma Thuột, Đắk Lắk",
    harvestTime: "Hôm nay",
  },
  eggs: {
    packages: [
      { label: "6 quả", price: 30_000, note: "Gói nhỏ" },
      { label: "10 quả", price: 48_000, note: "Hộp tiêu chuẩn" },
      { label: "20 quả", price: 92_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "6g", title: "Protein", note: "Trong một quả trứng cỡ vừa" },
      { value: "Vitamin D", title: "Dưỡng chất", note: "Nguồn dinh dưỡng tự nhiên" },
    ],
    highlight: "Trứng gà nuôi thảo mộc, được thu gom và đóng gói cẩn thận từ trang trại đối tác.",
    farmName: "Trang trại gà thảo mộc",
    location: "Lâm Đồng, Việt Nam",
    harvestTime: "Hôm nay",
  },
  mushrooms: {
    packages: [
      { label: "250g", price: 28_000, note: "Khay nhỏ" },
      { label: "500g", price: 52_000, note: "Gia đình" },
      { label: "1 kg", price: 99_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "3.1g", title: "Protein", note: "Trong mỗi 100g" },
      { value: "Vitamin B", title: "Dưỡng chất", note: "Dùng trong bữa ăn cân bằng" },
    ],
    highlight: "Nấm tươi có vị ngọt tự nhiên, thích hợp cho món xào, canh hoặc lẩu rau củ.",
    farmName: "Nông trại nấm hữu cơ",
    location: "Đà Lạt, Lâm Đồng",
    harvestTime: "Hôm nay",
  },
  rice: {
    packages: [
      { label: "1 kg", price: 62_000, note: "Gói nhỏ" },
      { label: "2 kg", price: 115_000, note: "Gia đình" },
      { label: "5 kg", price: 270_000, note: "Tiết kiệm" },
    ],
    nutrition: [
      { value: "ST25", title: "Giống lúa", note: "Hạt dài, thơm tự nhiên" },
      { value: "100%", title: "Gạo hữu cơ", note: "Đóng gói kín sau thu hoạch" },
    ],
    highlight: "Gạo ST25 thơm dịu, hạt cơm mềm dẻo; bảo quản nơi khô ráo và thoáng mát.",
    farmName: "Hợp tác xã lúa tôm hữu cơ",
    location: "Đồng bằng sông Cửu Long",
    harvestTime: "Vụ mùa mới",
  },
};

export function getProductDetailSpec(product: Product): ProductDetailSpec {
  const spec = specs[product.id];
  const defaultPackage: PackageOption = {
    label: product.subtitle.match(/[\d.]+\s?(?:g|kg|quả)/i)?.[0] ?? "1 phần",
    price: product.price,
    oldPrice: product.oldPrice,
    note: "Đóng gói tiêu chuẩn",
  };

  return {
    gallery: spec?.gallery ?? [product.image],
    packages: spec?.packages ?? [defaultPackage],
    nutrition: spec?.nutrition ?? [
      { value: "Tươi", title: "Thu hoạch theo mùa", note: "Sản phẩm từ nhà vườn đối tác" },
      { value: "100%", title: "Nguồn gốc rõ ràng", note: "Thông tin lô hàng minh bạch" },
    ],
    highlight: spec?.highlight ?? "Sản phẩm được chọn lọc từ nhà vườn đối tác, đóng gói cẩn thận để giữ chất lượng tươi ngon.",
    farmName: spec?.farmName ?? product.origin,
    location: spec?.location ?? "Việt Nam",
    harvestTime: spec?.harvestTime ?? "Hôm nay",
  };
}
