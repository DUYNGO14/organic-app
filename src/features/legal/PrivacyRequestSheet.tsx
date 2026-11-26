import { PrimaryBtn } from "@/components/common";
import { SheetTextInput } from "@/components/common/Input/SheetTextInput";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FilePenLine, Send } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppSheet, SheetFooter, type AppSheetHandle } from "@/components/common/BottomSheet";
import { createPrivacyRequest } from "./legal.service";
import type { PrivacyRequestKind } from "./legal.types";

const requestKinds: readonly { id: PrivacyRequestKind; label: string }[] = [
  { id: "access", label: "Truy cập dữ liệu" },
  { id: "correct", label: "Chỉnh sửa" },
  { id: "delete", label: "Xoá dữ liệu" },
  { id: "other", label: "Khác" },
];

export function PrivacyRequestSheet({ onClose }: { onClose: () => void }) {
  const sheet = useRef<AppSheetHandle>(null);
  const colors = useAppColors();
  const phone = useAuthStore((state) => state.user?.phone);
  const [kind, setKind] = useState<PrivacyRequestKind>("access");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!phone) {
      Toast.show({ type: "error", text1: "Cần đăng nhập", text2: "Vui lòng đăng nhập để gửi yêu cầu dữ liệu." });
      return;
    }
    setSubmitting(true);
    try {
      await createPrivacyRequest(phone, kind, note);
      Toast.show({ type: "success", text1: "Đã ghi nhận yêu cầu", text2: "Yêu cầu đang chờ đội ngũ pháp lý xử lý." });
      sheet.current?.dismiss();
    } catch {
      Toast.show({ type: "error", text1: "Chưa thể gửi yêu cầu", text2: "Vui lòng thử lại sau." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppSheet
      ref={sheet}
      mode="inline"
      header={{
        icon: <FilePenLine color={colors.primary} size={20} />,
        title: "Yêu cầu về dữ liệu cá nhân",
        subtitle: "Bản ghi hiện được lưu trên thiết bị cho đến khi hệ thống hỗ trợ được kết nối.",
      }}
      onDismiss={onClose}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text className="mb-2 font-vietnam text-label-md text-ink">Loại yêu cầu</Text>
          <View className="flex-row flex-wrap gap-2">
            {requestKinds.map((item) => {
              const selected = item.id === kind;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`min-h-12 items-center justify-center rounded-full border px-3 ${selected ? "border-primary bg-primary" : "border-border bg-surface"}`}
                  onPress={() => setKind(item.id)}
                >
                  <Text className={`font-vietnam text-label-md ${selected ? "text-on-primary" : "text-ink"}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View>
          <Text className="mb-2 font-vietnam text-label-md text-ink">Thông tin bổ sung</Text>
          <SheetTextInput
            accessibilityLabel="Thông tin bổ sung cho yêu cầu dữ liệu"
            className="min-h-28 rounded-lg border border-border bg-surface px-3 py-3 align-top font-vietnam text-body-md text-ink"
            multiline
            maxLength={500}
            placeholder="Ví dụ: phạm vi dữ liệu hoặc thông tin cần chỉnh sửa"
            placeholderTextColor={colors.muted}
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
          <Text className="mt-2 font-vietnam text-body-sm text-muted">Không gửi mật khẩu, mã OTP hoặc thông tin thanh toán trong biểu mẫu này.</Text>
        </View>
      </BottomSheetScrollView>
      <SheetFooter guardGesture>
        <PrimaryBtn fullWidth loading={submitting} title="Gửi yêu cầu" trailingIcon={<Send color={colors.onPrimary} size={18} />} onPress={() => void submit()} />
      </SheetFooter>
    </AppSheet>
  );
}
