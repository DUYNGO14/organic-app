import type { LegalDocument, LegalDocumentId } from "./legal.types";

export const LEGAL_DRAFT_NOTICE =
  "Bản nội dung này cần được ADIGO điền đủ thông tin pháp nhân và luật sư tại Việt Nam phê duyệt trước khi công bố chính thức.";

export const LEGAL_CONTACT_PLACEHOLDER = "[email pháp lý của ADIGO]";

const documents: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    id: "terms",
    title: "Điều khoản sử dụng",
    shortTitle: "Điều khoản sử dụng",
    description: "Quy tắc sử dụng ứng dụng Organic Việt Nam.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Phạm vi áp dụng", paragraphs: ["Điều khoản này điều chỉnh việc truy cập và sử dụng ứng dụng Organic Việt Nam do [tên pháp nhân ADIGO] vận hành. Khi sử dụng ứng dụng, người dùng xác nhận đã đọc và đồng ý với phiên bản điều khoản đang được áp dụng."] },
      { heading: "2. Tài khoản và xác thực", bullets: ["Người dùng cung cấp số điện thoại chính xác và tự bảo vệ mã OTP, thiết bị đăng nhập.", "Không chia sẻ mã OTP, thông tin phiên đăng nhập hoặc sử dụng tài khoản của người khác khi chưa được phép.", "ADIGO có thể tạm ngưng truy cập để bảo vệ an toàn hệ thống hoặc xử lý hành vi vi phạm pháp luật, với thông báo phù hợp khi có thể."] },
      { heading: "3. Sử dụng hợp lệ", bullets: ["Không can thiệp, khai thác trái phép, phát tán mã độc hoặc làm gián đoạn dịch vụ.", "Không đăng tải đánh giá, nội dung hoặc thông tin xâm phạm quyền, danh dự hay quyền riêng tư của người khác.", "Người dùng chịu trách nhiệm về tính chính xác của địa chỉ nhận hàng, thông tin liên hệ và yêu cầu đặt hàng."] },
      { heading: "4. Thay đổi điều khoản", paragraphs: ["Khi có thay đổi quan trọng, ADIGO sẽ công bố phiên bản mới trong Trung tâm pháp lý và yêu cầu xác nhận lại khi cần thiết. Việc tiếp tục sử dụng sau ngày hiệu lực được hiểu theo nội dung thông báo kèm phiên bản đó."] },
      { heading: "5. Liên hệ", paragraphs: [`Câu hỏi hoặc phản ánh về điều khoản gửi về ${LEGAL_CONTACT_PLACEHOLDER}. Thông tin pháp nhân, địa chỉ và cơ chế giải quyết tranh chấp sẽ được công bố đầy đủ trước khi phát hành chính thức.`] },
    ],
  },
  privacy: {
    id: "privacy",
    title: "Chính sách bảo mật dữ liệu cá nhân",
    shortTitle: "Chính sách bảo mật",
    description: "Cách ứng dụng thu thập, dùng và bảo vệ dữ liệu cá nhân.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Dữ liệu có thể được xử lý", bullets: ["Số điện thoại và dữ liệu phiên đăng nhập để xác thực tài khoản.", "Họ tên, địa chỉ giao hàng và ghi chú đơn hàng khi người dùng cung cấp.", "Vị trí chính xác chỉ khi người dùng cho phép, nhằm gợi ý địa chỉ nhận hàng.", "Dữ liệu quét mã QR từ camera khi người dùng chủ động dùng tính năng truy xuất.", "Thông tin đơn hàng, ưu đãi, đánh giá và yêu cầu hỗ trợ."] },
      { heading: "2. Mục đích xử lý", bullets: ["Cung cấp xác thực, đặt hàng, giao nhận, hỗ trợ khách hàng và phòng ngừa gian lận.", "Hiển thị truy xuất nguồn gốc, quản lý ưu đãi và cải thiện trải nghiệm dịch vụ.", "Thực hiện nghĩa vụ pháp lý và xử lý khiếu nại khi cần thiết."] },
      { heading: "3. Chia sẻ và bảo mật", paragraphs: ["Dữ liệu chỉ được chia sẻ với bên cung cấp dịch vụ cần thiết cho việc vận hành, giao nhận, thanh toán hoặc theo yêu cầu hợp pháp. Danh sách đơn vị xử lý dữ liệu, thời hạn lưu trữ, việc chuyển dữ liệu xuyên biên giới (nếu có) và biện pháp bảo vệ phải được pháp nhân công bố trước khi phát hành." ] },
      { heading: "4. Quyền của người dùng", paragraphs: [`Người dùng có thể yêu cầu truy cập, chỉnh sửa, xoá hoặc phản ánh về việc xử lý dữ liệu thông qua biểu mẫu trong ứng dụng hoặc ${LEGAL_CONTACT_PLACEHOLDER}. ADIGO sẽ xác minh yêu cầu trước khi phản hồi theo quy trình đã công bố.`] },
      { heading: "5. Quyền thiết bị", paragraphs: ["Người dùng có thể tắt quyền vị trí và camera trong cài đặt thiết bị. Việc tắt quyền có thể làm một số tính năng gợi ý địa chỉ hoặc quét QR không hoạt động."] },
    ],
  },
  sale: {
    id: "sale",
    title: "Điều khoản mua bán và thanh toán",
    shortTitle: "Mua bán và thanh toán",
    description: "Thông tin về hàng hoá, đặt hàng, giá và thanh toán.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Thông tin hàng hoá", paragraphs: ["ADIGO công bố thông tin sản phẩm, quy cách, giá và tình trạng có hàng trên ứng dụng. Nông sản tươi có thể có sai khác hợp lý về khối lượng, màu sắc hoặc mùa vụ; mọi quy tắc thay thế hàng phải được hiển thị rõ trước khi xác nhận đơn."] },
      { heading: "2. Xác nhận đơn hàng", paragraphs: ["Việc gửi yêu cầu đặt hàng chưa mặc nhiên là chấp nhận giao dịch. Trạng thái xác nhận, tình trạng thanh toán, thời gian giao và thông tin liên hệ hỗ trợ sẽ được thông báo theo quy trình vận hành đã công bố."] },
      { heading: "3. Giá và thanh toán", bullets: ["Tổng tiền, phí giao hàng, giảm giá và phương thức thanh toán phải được hiển thị để người dùng kiểm tra trước khi xác nhận.", "Người dùng chỉ thanh toán qua phương thức do ứng dụng hiển thị; không gửi thông tin nhạy cảm qua kênh không chính thức.", "Quy trình hoá đơn, đối soát và hoàn tiền sẽ được công bố cùng pháp nhân vận hành."] },
      { heading: "4. Huỷ đơn và hỗ trợ", paragraphs: ["Điều kiện huỷ đơn phụ thuộc trạng thái chuẩn bị và giao hàng. Người dùng cần liên hệ qua kênh hỗ trợ được công bố để nhận xác nhận xử lý."] },
    ],
  },
  delivery: {
    id: "delivery",
    title: "Chính sách giao hàng",
    shortTitle: "Giao hàng",
    description: "Khu vực, thời gian và trách nhiệm giao nhận.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Khu vực và thời gian giao", paragraphs: ["Khu vực phục vụ, khung giờ, phí giao và điều kiện giao hàng sẽ được hiển thị theo địa chỉ của người dùng trước khi đặt đơn. Thời gian dự kiến có thể thay đổi do thời tiết, giao thông, mùa vụ hoặc sự kiện bất khả kháng."] },
      { heading: "2. Nhận hàng", bullets: ["Người dùng cung cấp địa chỉ và số điện thoại có thể liên hệ khi giao.", "Người dùng kiểm tra đơn tại thời điểm nhận hàng theo hướng dẫn được hiển thị.", "Trường hợp giao không thành công, chi phí hoặc phương án xử lý chỉ áp dụng theo chính sách được công bố rõ ràng."] },
      { heading: "3. Theo dõi đơn", paragraphs: ["Thông tin trạng thái và vị trí giao hàng (nếu có) chỉ mang tính hỗ trợ vận hành, có thể được cập nhật theo độ chính xác của đối tác giao nhận."] },
    ],
  },
  returns: {
    id: "returns",
    title: "Chính sách đổi trả và hoàn tiền",
    shortTitle: "Đổi trả và hoàn tiền",
    description: "Quy trình phản ánh chất lượng, đổi trả và hoàn tiền.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Trạng thái chính sách", paragraphs: ["ADIGO chưa công bố cam kết thời hạn đổi trả. Điều kiện áp dụng, mốc tiếp nhận phản ánh, chứng từ cần thiết, hàng hoá loại trừ và thời hạn hoàn tiền phải được vận hành phê duyệt trước khi công bố chính thức."] },
      { heading: "2. Cách gửi phản ánh", paragraphs: ["Người dùng lưu giữ thông tin đơn hàng, mô tả tình trạng hàng hoá và liên hệ qua kênh hỗ trợ chính thức. ADIGO sẽ tiếp nhận, xác minh và phản hồi theo quy trình được công bố ở phiên bản chính thức."] },
      { heading: "3. Hoàn tiền", paragraphs: ["Nếu yêu cầu được chấp thuận, phương thức và thời gian hoàn tiền phải được thông báo rõ cho người dùng. Không tự gửi hàng hoặc chi trả qua kênh ngoài hướng dẫn chính thức."] },
    ],
  },
  ecommerce: {
    id: "ecommerce",
    title: "Thông tin pháp lý và thương mại điện tử",
    shortTitle: "Thông tin pháp lý",
    description: "Thông tin đơn vị vận hành, liên hệ và công bố TMĐT.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Đơn vị vận hành", bullets: ["Tên pháp nhân: [tên pháp nhân ADIGO].", "Mã số doanh nghiệp/mã số thuế: [mã số].", "Địa chỉ trụ sở: [địa chỉ].", "Đầu mối chăm sóc khách hàng và khiếu nại: [địa chỉ email/số điện thoại]."] },
      { heading: "2. Thương mại điện tử", paragraphs: ["Trạng thái thông báo hoặc đăng ký ứng dụng thương mại điện tử với cơ quan có thẩm quyền chỉ được hiển thị khi đã nhận xác nhận thực tế. Ứng dụng không sử dụng biểu tượng hoặc tuyên bố xác nhận khi chưa được cấp." ] },
      { heading: "3. Khiếu nại và tranh chấp", paragraphs: ["Quy trình tiếp nhận, thời hạn phản hồi, cơ quan giải quyết và luật áp dụng sẽ được pháp nhân hoàn thiện, rà soát và công bố trước khi phát hành chính thức."] },
    ],
  },
  rewards: {
    id: "rewards",
    title: "Quy chế Điểm Xanh và ưu đãi",
    shortTitle: "Điểm Xanh và ưu đãi",
    description: "Điều kiện tích điểm, voucher và đánh giá sản phẩm.",
    version: "0.1 (dự thảo)",
    effectiveDate: "Chưa công bố",
    sections: [
      { heading: "1. Điểm Xanh và voucher", paragraphs: ["Điểm Xanh, voucher và quà tặng là chương trình khuyến mại theo điều kiện riêng của từng ưu đãi. Giá trị quy đổi, điều kiện sử dụng, thời hạn, số lượng và trường hợp không áp dụng phải được hiển thị tại thời điểm nhận ưu đãi."] },
      { heading: "2. Đánh giá", paragraphs: ["Người dùng chỉ đăng đánh giá trung thực về đơn hàng đã mua. ADIGO có thể ẩn nội dung vi phạm pháp luật, xúc phạm, quảng cáo không được phép hoặc tiết lộ dữ liệu cá nhân."] },
      { heading: "3. Thay đổi chương trình", paragraphs: ["ADIGO sẽ công bố thay đổi áp dụng cho chương trình tương lai theo điều kiện cụ thể; quyền lợi đã phát hành được xử lý theo thông tin hiển thị khi người dùng nhận ưu đãi."] },
    ],
  },
};

export const legalDocuments = Object.values(documents);

export function getLegalDocument(id: string | undefined) {
  return id && id in documents ? documents[id as LegalDocumentId] : null;
}
