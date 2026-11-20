export type FarmDetail = {
  title: string;
  description: string;
  image?: number;
  mapQuery?: string;
  productIds?: readonly string[];
};

export const greenhouse: FarmDetail = {
  title: "Nhà màng A3 · Lạc Dương",
  description: "Ảnh minh họa khu thu hoạch xà lách thủy canh tại cao nguyên Lạc Dương, Lâm Đồng.",
  image: require("@/assets/images/farm/greenhouse.jpg"),
  productIds: ["lettuce-lollo"],
};

export const featuredStory = {
  title: "Đợt hái dâu tây Hana sương sớm Mộc Châu chính thức bắt đầu",
  description: "Dâu tây Hana được thu hái lúc 5 giờ 30, khi trời còn mát. Người trồng chọn những quả chín đều và xếp nhẹ vào khay để giữ vị ngọt tự nhiên. Lô thu hoạch trong ký sự có độ ngọt 12,8°Bx.",
  image: require("@/assets/images/farm/strawberries.jpg"),
  productIds: ["strawberries"],
  author: "Kỹ sư Trần Bình",
  label: "Đợt hái đầu mùa",
};

export const stories = [
  {
    title: "Bí quyết chăm cải Kale bằng đạm cá ủ men tự nhiên",
    description: "Ký sự của HTX An Nhiên giới thiệu cách dùng đạm cá ủ men để chăm cải Kale, cùng thời điểm thu hái giúp lá giữ độ giòn.",
    image: require("@/assets/images/farm/kale.jpg"),
    productIds: ["kale"],
    author: "HTX An Nhiên",
    tags: ["#HữuCơ", "#ĐàLạt"],
  },
  {
    title: "Nuôi gà thả đồi với giun quế và bắp hạt",
    description: "Trại Gà Đồi Eakao chia sẻ cách bố trí bãi thả có bóng mát và bổ sung giun quế, bắp hạt vào khẩu phần của đàn gà.",
    image: require("@/assets/images/farm/free-range-chickens.jpg"),
    author: "Trại Gà Đồi Eakao",
    tags: ["#ThảoMộc", "#ChănNuôi"],
  },
];

export const regions = [
  { title: "Đà Lạt", description: "Rau lá mát, củ quả", mapQuery: "Đà Lạt, Lâm Đồng", harvest: "Rau lá được hái vào sáng sớm, sau đó làm mát trước khi đóng gói.", productIds: ["kale"] },
  { title: "Đắk Lắk", description: "Bơ sáp, sầu riêng", mapQuery: "Đắk Lắk, Việt Nam", harvest: "Nhà vườn chọn bơ theo độ già của quả và phân loại sau thu hoạch.", productIds: ["avocado"] },
  { title: "Mộc Châu", description: "Dâu tây Hana, mận hậu", mapQuery: "Mộc Châu, Sơn La", harvest: "Dâu Hana được hái khi trời còn mát. Mận hậu được chọn theo độ chín của từng đợt.", productIds: ["strawberries"] },
  { title: "Củ Chi", description: "Nấm và rau mầm", mapQuery: "Củ Chi, TP. Hồ Chí Minh", harvest: "Rau mầm và nấm được thu theo các đợt nhỏ để thuận tiện sơ chế và bảo quản." },
];

export const forecast: FarmDetail = {
  title: "Đợt hái sương sớm",
  description: "Bản tin mùa vụ giới thiệu dâu tây Hana và cà chua bi. Bạn có thể xem tình trạng và giá hiện tại trong danh mục sản phẩm.",
  productIds: ["strawberries", "tomatoes"],
};

export const commitments = [
  {
    title: "Không thuốc trừ sâu và diệt cỏ hóa học",
    description: "Ưu tiên thiên địch, chế phẩm sinh học và nhà lưới để bảo vệ cây trồng.",
  },
  {
    title: "Không chất bảo quản sau thu hoạch",
    description: "Giữ nông sản tươi bằng cách làm mát, đóng gói và vận chuyển trong chuỗi lạnh.",
  },
  {
    title: "Không dùng chất kích thích tăng trưởng",
    description: "Chọn giống phù hợp với vùng trồng và thu hoạch theo chu kỳ sinh trưởng tự nhiên.",
  },
];

export const coldChain: FarmDetail = {
  title: "Chuỗi lạnh",
  description: "Nông sản được phân loại và làm mát sau khi thu hoạch, sau đó đóng gói và vận chuyển lạnh để giữ độ tươi. Nhiệt độ bảo quản phụ thuộc vào từng loại nông sản.",
};

export const certificates: FarmDetail = {
  title: "Chứng nhận VietGAP và Organic EU",
  description: "VietGAP hướng dẫn thực hành nông nghiệp tốt tại Việt Nam. Organic EU quy định các tiêu chuẩn cho sản xuất và ghi nhãn hữu cơ tại Liên minh châu Âu. Hồ sơ chứng nhận của từng nông trại đang được cập nhật.",
};
