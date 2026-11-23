export type FarmDetail = {
  title: string;
  description: string;
  image?: number;
  mapQuery?: string;
  productIds?: readonly string[];
};

export type FarmStory = Omit<FarmDetail, "image" | "mapQuery"> & {
  image: number;
  author: string;
  label?: string;
  location?: string;
  tags?: readonly string[];
  sections: readonly { title: string; text: string }[];
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
  location: "Mộc Châu",
  sections: [
    {
      title: "Chọn quả tại luống",
      text: "Người hái quan sát màu quả ngay trên cây. Quả chín đều được đưa vào khay, còn những quả chưa tới độ chín được giữ lại cho lượt hái sau. Khi hái, người trồng cầm nhẹ ở cuống để hạn chế làm dập phần thịt quả.",
    },
    {
      title: "Từ luống dâu đến khay",
      text: "Quả được xếp nhẹ vào khay ngay sau khi hái để hạn chế va chạm khi di chuyển. Độ ngọt 12,8°Bx được ghi nhận ở lô đầu mùa trong ký sự này. Chỉ số có thể thay đổi theo độ chín và từng đợt hái.",
    },
  ],
} satisfies FarmStory;

export const stories: readonly FarmStory[] = [
  {
    title: "Bí quyết chăm cải Kale bằng đạm cá ủ men tự nhiên",
    description: "Ký sự của HTX An Nhiên giới thiệu cách dùng đạm cá ủ men để chăm cải Kale, cùng thời điểm thu hái giúp lá giữ độ giòn.",
    image: require("@/assets/images/farm/kale.jpg"),
    productIds: ["kale"],
    author: "HTX An Nhiên",
    tags: ["#HữuCơ", "#ĐàLạt"],
    sections: [
      {
        title: "Theo dõi lá giữa các lần chăm bón",
        text: "Đạm cá ủ men là một nguồn dinh dưỡng mà hợp tác xã sử dụng khi chăm cải Kale. Giữa các lần chăm bón, người trồng quan sát màu lá, đọt non và độ ẩm đất để biết luống cải đang phát triển ra sao.",
      },
      {
        title: "Hái lá ngoài, giữ lại đọt non",
        text: "Khi thu hái, người trồng chọn các lá ngoài đã đủ lớn và giữ lại phần đọt giữa để cây tiếp tục ra lá. Hái lúc trời còn mát giúp lá hạn chế mất nước trước khi được đưa đi sơ chế.",
      },
    ],
  },
  {
    title: "Nuôi gà thả đồi với giun quế và bắp hạt",
    description: "Trại Gà Đồi Eakao chia sẻ cách bố trí bãi thả có bóng mát và bổ sung giun quế, bắp hạt vào khẩu phần của đàn gà.",
    image: require("@/assets/images/farm/free-range-chickens.jpg"),
    author: "Trại Gà Đồi Eakao",
    tags: ["#ThảoMộc", "#ChănNuôi"],
    sections: [
      {
        title: "Bóng mát trên bãi thả",
        text: "Bãi thả có khoảng trống để đàn gà đi lại và những chỗ râm để nghỉ khi trời nắng. Máng nước được đặt ở nơi đàn dễ tìm, gần khu vực có bóng mát.",
      },
      {
        title: "Giun quế và bắp trong khẩu phần",
        text: "Trại dùng giun quế và bắp hạt để bổ sung vào khẩu phần hằng ngày. Người chăm đàn quan sát lượng thức ăn còn lại và mức độ hoạt động của gà để điều chỉnh cách cho ăn theo từng giai đoạn.",
      },
    ],
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
