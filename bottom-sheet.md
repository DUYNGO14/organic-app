# @gorhom/bottom-sheet — Hướng dẫn cho AI

## Bottom sheet trong ứng dụng

- Dùng `AppSheet` từ `@/components/common/BottomSheet`. Render component khi cần mở và cập nhật trạng thái màn hình trong `onDismiss`.
- Mặc định dùng chế độ modal. Dùng `mode="inline"` cho sheet nằm trong màn hình. Truyền `snapPoints` nếu cần chiều cao cố định. Modal có thể tự đo chiều cao nội dung khi bỏ qua `snapPoints`.
- Truyền `header` cho tiêu đề và nút đóng theo chuẩn. Dùng `SheetFooter` cho vùng nút cố định và `SheetTextInput` cho ô nhập. Giữ logic lưu dữ liệu trong tính năng và gọi `dismiss()` qua ref để đóng sau khi hoàn tất.

> Nguồn: https://gorhom.dev/react-native-bottom-sheet/
> Phiên bản mục tiêu: v5.x. Khi nghi ngờ, kiểm tra lại docs chính thức.

## Quy tắc bắt buộc khi sinh code

1. Dùng `@gorhom/bottom-sheet` v5 (KHÔNG dùng API của v4 như `useBottomSheetDynamicSnapPoints`, đã bị xoá).
2. Ứng dụng phải được bọc bằng `GestureHandlerRootView` ở root (`style={{ flex: 1 }}`).
3. Nếu dùng `BottomSheetModal`, phải bọc cây component bằng `BottomSheetModalProvider`.
4. Bên trong sheet, dùng component của thư viện thay cho component gốc của RN:
   - `ScrollView` → `BottomSheetScrollView`
   - `FlatList` → `BottomSheetFlatList`
   - `SectionList` → `BottomSheetSectionList`
   - `TextInput` → `BottomSheetTextInput`
   - Nội dung tĩnh → `BottomSheetView`
5. Dùng `useCallback`/`useMemo` cho `snapPoints`, `renderBackdrop`, handler để tránh re-render.
6. `react-native-reanimated/plugin` phải là plugin CUỐI CÙNG trong `babel.config.js`.
7. Không đặt nhiều scrollable lồng nhau trong một sheet.

## Cài đặt

```bash
# Expo
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler

# React Native CLI
yarn add @gorhom/bottom-sheet@^5 react-native-reanimated react-native-gesture-handler
```

Peer dependencies: `react-native-reanimated` (>= 3), `react-native-gesture-handler` (>= 2).

```js
// babel.config.js
module.exports = {
  presets: ["module:@react-native/babel-preset"], // hoặc babel-preset-expo
  plugins: ["react-native-reanimated/plugin"], // luôn đặt cuối
};
```

## Component chính

| Component                                                                                                 | Mục đích                                                               |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `BottomSheet`                                                                                             | Sheet gắn cố định trong cây component                                  |
| `BottomSheetModal`                                                                                        | Sheet dạng modal, mở bằng `present()` (cần `BottomSheetModalProvider`) |
| `BottomSheetView`                                                                                         | Container nội dung thường                                              |
| `BottomSheetScrollView` / `BottomSheetFlatList` / `BottomSheetSectionList` / `BottomSheetVirtualizedList` | Nội dung cuộn được                                                     |
| `BottomSheetTextInput`                                                                                    | Input tương thích với keyboard handling                                |
| `BottomSheetBackdrop`                                                                                     | Lớp nền mờ                                                             |
| `BottomSheetHandle`                                                                                       | Thanh kéo mặc định (có thể thay bằng `handleComponent`)                |
| `BottomSheetFooter`                                                                                       | Footer cố định (dùng với `footerComponent`)                            |

## Props thường dùng (BottomSheet / BottomSheetModal)

- `snapPoints`: mảng số hoặc chuỗi phần trăm, vd `['25%', '50%', '90%']`.
- `index`: chỉ số snap point ban đầu (`-1` = đóng; chỉ với `BottomSheet`).
- `enableDynamicSizing`: tự tính chiều cao theo nội dung (mặc định `true` ở v5). Giới hạn bằng `maxDynamicContentSize`.
- `enablePanDownToClose`: kéo xuống để đóng.
- `enableContentPanningGesture` / `enableHandlePanningGesture`: bật/tắt gesture.
- `enableOverDrag`: cho kéo vượt biên.
- `backdropComponent`: component backdrop.
- `handleComponent`, `handleIndicatorStyle`, `handleStyle`.
- `backgroundStyle`, `style`, `containerStyle`.
- `topInset`, `bottomInset`, `detached` (sheet nổi, kết hợp `bottomInset`).
- `keyboardBehavior`: `'interactive' | 'extend' | 'fillParent'`.
- `keyboardBlurBehavior`: `'none' | 'restore'`.
- `android_keyboardInputMode`: `'adjustPan' | 'adjustResize'`.
- `animateOnMount`, `animationConfigs`.
- Callbacks: `onChange(index)`, `onAnimate(from, to)`, `onClose`, `onDismiss` (modal).
- Chỉ Modal: `name`, `stackBehavior` (`'push' | 'replace'`), `enableDismissOnClose`.

## Methods (qua ref)

`BottomSheet`: `snapToIndex(i)`, `snapToPosition(pos)`, `expand()`, `collapse()`, `close()`, `forceClose()`.

`BottomSheetModal`: `present(data?)`, `dismiss()`, cộng thêm các method snap/expand/collapse/close ở trên.

## Hooks

- `useBottomSheet()` — trong sheet: `expand`, `collapse`, `close`, `snapToIndex`, `animatedIndex`, `animatedPosition`…
- `useBottomSheetModal()` — `dismiss(key?)`, `dismissAll()`.
- `useBottomSheetSpringConfigs`, `useBottomSheetTimingConfigs` — tuỳ biến animation.
- `useBottomSheetGestureHandlers`, `useBottomSheetInternal` — nâng cao.

## Mẫu code

### BottomSheet cơ bản

```tsx
import React, { useCallback, useMemo, useRef } from "react";
import { Button, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

export default function App() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <Button title="Mở" onPress={() => sheetRef.current?.expand()} />
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.content}>
          <Text>Nội dung sheet</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 16 },
});
```

### BottomSheetModal

```tsx
import React, { useCallback, useRef } from "react";
import { Button } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

export default function App() {
  const modalRef = useRef<BottomSheetModal>(null);
  const open = useCallback(() => modalRef.current?.present(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Button title="Present" onPress={open} />
        <BottomSheetModal ref={modalRef} enablePanDownToClose>
          <BottomSheetView style={{ padding: 16 }}>{/* ... */}</BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
```

### Danh sách cuộn

```tsx
<BottomSheet snapPoints={["50%", "90%"]}>
  <BottomSheetFlatList
    data={items}
    keyExtractor={(i) => i.id}
    renderItem={({ item }) => <Row item={item} />}
    contentContainerStyle={{ paddingBottom: 24 }}
  />
</BottomSheet>
```

### Input + bàn phím

```tsx
<BottomSheet
  snapPoints={["50%"]}
  keyboardBehavior="interactive"
  keyboardBlurBehavior="restore"
  android_keyboardInputMode="adjustResize"
>
  <BottomSheetView>
    <BottomSheetTextInput placeholder="Nhập..." />
  </BottomSheetView>
</BottomSheet>
```

## Lỗi thường gặp

| Triệu chứng                                            | Nguyên nhân / cách sửa                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Sheet không kéo được, gesture không chạy               | Thiếu `GestureHandlerRootView` ở root                                          |
| `Cannot read property ... of undefined` với Reanimated | Plugin Reanimated chưa ở cuối `babel.config.js`; xoá cache (`--reset-cache`)   |
| `BottomSheetModal` không hiện                          | Thiếu `BottomSheetModalProvider`                                               |
| Danh sách không cuộn cùng sheet                        | Dùng `ScrollView`/`FlatList` gốc thay vì bản `BottomSheet*`                    |
| Bàn phím che input                                     | Dùng `BottomSheetTextInput` + `keyboardBehavior` / `android_keyboardInputMode` |
| Sheet nhảy / nháy khi mount                            | Memo hoá `snapPoints`; kiểm tra `enableDynamicSizing` và `index`               |
| Lỗi sau khi nâng cấp từ v4                             | Bỏ `useBottomSheetDynamicSnapPoints`, dùng `enableDynamicSizing`               |

## Ghi chú cho AI

- Ưu tiên TypeScript, kiểu ref: `useRef<BottomSheet>(null)` / `useRef<BottomSheetModal>(null)`.
- Không bịa prop. Nếu không chắc một prop có tồn tại, hãy tra docs: https://gorhom.dev/react-native-bottom-sheet/
- Không dùng `Modal` của React Native khi người dùng yêu cầu bottom sheet từ thư viện này.
- Giữ code ngắn gọn, tách `renderBackdrop` và `snapPoints` ra ngoài JSX.
