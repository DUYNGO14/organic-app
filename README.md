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

## Nối dữ liệu API với skeleton

Dùng `QueryClient` hiện có và giữ dữ liệu máy chủ trong TanStack Query. Khi nối API, truyền `isLoading={query.isLoading && query.data === undefined}` cho màn hình, ví dụ `<ProductsScreen initialSearch="" isLoading={isLoading} />`. Đồng thời thay nguồn dữ liệu mẫu bằng dữ liệu query đã chuyển đổi sang kiểu mà màn hình dùng.

- Lần tải đầu hiện skeleton. Khi refetch nền hoặc chuyển trang bằng `keepPreviousData`, tiếp tục hiện dữ liệu đang có.
- Nếu request bị tạm dừng khi ngoại tuyến và chưa có dữ liệu, hiện trạng thái ngoại tuyến. Nếu request lỗi và chưa có dữ liệu, hiện lỗi và nút thử lại bằng `refetch()`. Mảng rỗng từ request thành công dùng giao diện trống.

### Phân trang và cuộn vô hạn

`useProducts({ limit: 20, skip: pageIndex * 20 })` dùng cho phân trang theo số trang. Dùng `isPlaceholderData` để nhận biết khi danh sách còn hiển thị trang trước. Với cuộn vô hạn, dùng `useInfiniteProducts({ limit: 20 })` và ghép `data.pages`:

```tsx
const products = useInfiniteProducts({ limit: 20 });

<FlashList
  data={products.data?.pages.flatMap((page) => page.products) ?? []}
  keyExtractor={(product) => String(product.id)}
  renderItem={renderProduct}
  onEndReached={() => {
    if (products.hasNextPage && !products.isFetching) {
      void products.fetchNextPage({ cancelRefetch: false });
    }
  }}
  ListFooterComponent={products.isFetchingNextPage ? <ActivityIndicator /> : null}
/>;
```

### Đồng bộ cache sau khi ghi

Khi có endpoint thêm, sửa hoặc xoá, dùng `useMutation` gọi API. Sau khi máy chủ xác nhận, cập nhật cache chi tiết từ phản hồi hoặc xoá bản ghi chi tiết đã bị xoá. Sau đó gọi `invalidateQueries({ queryKey: productKeys.lists() })` để đồng bộ cả danh sách phân trang và danh sách cuộn vô hạn.

Với optimistic update, ví dụ sau dành cho API sửa một sản phẩm khi endpoint đã sẵn sàng. Khoá nút lưu cho sản phẩm đang gửi để các lượt sửa trên cùng sản phẩm không ghi đè bản sao dùng để rollback.

```tsx
const updateProduct = useMutation({
  mutationFn: ({ id, title }: { id: number; title: string }) =>
    updateProductApi(id, { title }),
  onMutate: async ({ id, title }) => {
    const key = productKeys.detail(id);
    await queryClient.cancelQueries({ queryKey: key, exact: true });
    const previous = queryClient.getQueryData<Product>(key);
    if (previous) queryClient.setQueryData(key, { ...previous, title });
    return { key, previous };
  },
  onError: (_error, _variables, context) => {
    if (context?.previous) {
      queryClient.setQueryData(context.key, context.previous);
    }
  },
  onSettled: async (_data, _error, { id }) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id), exact: true }),
      queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    ]);
  },
});
```

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

## Thử quét QR truy xuất nguồn gốc

Mở **Quét mã QR** trong app, rồi dùng camera quét một trong hai ảnh sau trên màn hình khác hoặc trên bản in:

| Ảnh QR | Nội dung mã | Thu hoạch (giờ Việt Nam) |
| --- | --- | --- |
| [Lô KL-2408](assets/images/traceability-demo/KL-2408.png) | `ADIGO:LOT:KL-2408` | 05:14 ngày 24/08/2026 |
| [Lô KL-2508](assets/images/traceability-demo/KL-2508.png) | `ADIGO:LOT:KL-2508` | 06:10 ngày 25/08/2026 |

Cả hai mã mở cùng sản phẩm **Cải Kale Thủy Canh** nhưng tra cứu hai lô khác nhau. QR chứa mã lô để tra cứu trong app. Kết quả có nhãn **Dữ liệu mẫu**.

Khi có backend, thay hàm tra cứu mẫu trong `src/features/products/traceability.queries.ts` bằng lời gọi API có truyền `AbortSignal`. Giữ cache key theo mã lô, trả về `null` cho mã không tồn tại và để lỗi kết nối đi vào trạng thái thử lại. Bỏ `networkMode: "always"` khi tra cứu bắt đầu cần mạng.

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
