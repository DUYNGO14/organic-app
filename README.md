# ADIGO

Ứng dụng di động thương mại nông sản hữu cơ ADIGO, xây dựng bằng Expo và React Native. Ứng dụng hỗ trợ khám phá sản phẩm, truy xuất QR, giỏ hàng, địa chỉ giao nhận, theo dõi đơn hàng, tài khoản và trung tâm pháp lý.

## Công nghệ

- Expo SDK 58, React Native 0.88, React 19, TypeScript
- Expo Router cho điều hướng theo file
- NativeWind 4 + Tailwind CSS 3 cho giao diện light/dark
- Zustand cho client state, TanStack Query + Axios cho server state/API
- React Hook Form + Zod cho biểu mẫu
- FlashList cho danh sách, Expo Image cho ảnh, Lucide cho biểu tượng
- Expo SecureStore cho phiên đăng nhập và dữ liệu cần mã hoá
- Gorhom Bottom Sheet, Reanimated và Gesture Handler cho tương tác

## Yêu cầu môi trường

- Node.js LTS đang được kích hoạt trong terminal
- npm (dự án dùng `package-lock.json`)
- Expo Go cho các tính năng chỉ dùng Expo Go; development build cho native module không có sẵn trong Expo Go

## Cài đặt và chạy ứng dụng

```bash
npm install
npx expo start
```

Sau khi khởi động, quét QR bằng Expo Go hoặc chọn thiết bị/emulator trong Expo CLI.

Các lệnh thường dùng:

```bash
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
npx expo-doctor
```

> Nếu terminal báo `No active Node.js version is configured`, hãy kích hoạt hoặc cài một phiên bản Node.js trước khi chạy các lệnh Expo.

## Biến môi trường

Tạo file `.env` tại thư mục gốc khi cần kết nối backend:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

Nếu không khai báo, ứng dụng dùng DummyJSON làm API mẫu. Không đặt token, khoá riêng tư hoặc bí mật trong biến `EXPO_PUBLIC_*` vì chúng được đóng gói vào ứng dụng.

## Cấu trúc dự án

```text
src/
├── app/                 # Routes Expo Router
│   ├── (auth)/          # Đăng nhập và OTP
│   ├── (onboarding)/    # Onboarding
│   ├── (product)/       # Chi tiết sản phẩm
│   ├── (tabs)/          # Trang chủ, danh mục, nông trại, đơn hàng, hồ sơ
│   └── legal/           # Trung tâm pháp lý và tài liệu pháp lý
├── components/          # Component dùng chung
├── features/            # Logic và UI theo miền nghiệp vụ
├── hooks/               # React hooks
├── lib/                 # Axios, storage, tiện ích nền tảng
├── providers/           # Provider toàn ứng dụng
└── stores/              # Client state dùng chung
assets/                  # Font Be Vietnam Pro, ảnh và biểu tượng
```

## Quy ước phát triển

- Đọc `AGENTS.md` và `DESIGN.md` trước khi thay đổi UI.
- Route chỉ nằm trong `src/app`; component, hook và service nằm ngoài route.
- Dùng token NativeWind đã khai báo trong `global.css` và `tailwind.config.js`; không hard-code màu cho UI.
- Dùng `FlashList` cho danh sách dài/dynamic, `expo-image` cho ảnh và `@gorhom/bottom-sheet` v5 cho bottom sheet.
- Dùng `expo-secure-store` cho token/secret; dữ liệu không nhạy cảm có thể dùng MMKV khi phù hợp.
- Không sửa trực tiếp thư mục `android/` hoặc `ios/`; cấu hình native qua `app.json` và config plugin.

## Quyền thiết bị

Ứng dụng chỉ yêu cầu quyền khi người dùng sử dụng tính năng tương ứng:

- Vị trí: gợi ý địa chỉ giao nhận.
- Camera: quét mã QR truy xuất nguồn gốc.

Nội dung mô tả quyền nằm trong `app.json`. Khi thay đổi quyền hoặc thêm native module, cần tạo development build mới để kiểm thử đầy đủ.

## Pháp lý và quyền riêng tư

Trung tâm pháp lý nằm tại `/legal`, gồm Điều khoản sử dụng, Chính sách bảo mật dữ liệu cá nhân, chính sách mua bán/giao hàng/đổi trả và quy chế ưu đãi. Nội dung hiện được đánh dấu là bản dự thảo; cần hoàn tất thông tin pháp nhân, email pháp lý và phê duyệt pháp lý trước khi phát hành chính thức.

## Build và phát hành EAS

```bash
npx eas-cli@latest build --profile development
npx eas-cli@latest build --profile preview
npx eas-cli@latest build --profile production
npx eas-cli@latest update --channel production --message "Mô tả bản cập nhật"
```

Các profile build và channel được cấu hình tại `eas.json`. Dự án dùng Continuous Native Generation, vì vậy không cần tạo hay chỉnh sửa native project thủ công.

## Kiểm tra trước khi bàn giao

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

Kiểm tra thêm trên Android và iOS: đăng nhập OTP, cấp/từ chối quyền camera-vị trí, dark mode, điều hướng tab, checkout và bottom sheet.
