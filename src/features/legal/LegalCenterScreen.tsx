import { IconButton, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, FileLock2, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEGAL_CONTACT_PLACEHOLDER, LEGAL_DRAFT_NOTICE, legalDocuments } from "./legal.data";
import { getLegalAcceptances, getPrivacyRequests } from "./legal.service";
import type { LegalAcceptance, PrivacyRequest } from "./legal.types";
import { PrivacyRequestSheet } from "./PrivacyRequestSheet";

export function LegalCenterScreen() {
  const colors = useAppColors();
  const phone = useAuthStore((state) => state.session?.phone);
  const [acceptances, setAcceptances] = useState<LegalAcceptance[]>([]);
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);

  const refresh = useCallback(() => {
    if (!phone) return;
    void Promise.all([getLegalAcceptances(phone), getPrivacyRequests(phone)]).then(([nextAcceptances, nextRequests]) => {
      setAcceptances(nextAcceptances);
      setRequests(nextRequests);
    });
  }, [phone]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <View className="min-h-14 flex-row items-center border-b border-border bg-surface px-3">
        <IconButton icon={<ChevronLeft color={colors.ink} size={22} />} label="Quay lại" onPress={() => router.back()} />
        <Text className="ml-1 flex-1 font-vietnam text-title-md text-ink">Trung tâm pháp lý</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-warning/30 bg-warning-container p-4">
          <Text className="font-vietnam text-label-lg text-warning">Tài liệu chưa công bố</Text>
          <Text className="mt-1 font-vietnam text-body-sm text-warning">{LEGAL_DRAFT_NOTICE}</Text>
        </View>

        <Text className="mt-6 font-vietnam text-headline-sm text-ink">Chính sách và điều khoản</Text>
        <Text className="mt-1 font-vietnam text-body-md text-muted">Đọc phiên bản, ngày hiệu lực và trạng thái ghi nhận của từng tài liệu.</Text>
        <View className="mt-4 overflow-hidden rounded-xl border border-card-border bg-surface">
          {legalDocuments.map((document, index) => {
            const accepted = acceptances.find((item) => item.documentId === document.id && item.version === document.version);
            return (
              <Pressable key={document.id} className={`min-h-20 flex-row items-center gap-3 px-4 py-3 active:bg-surface-soft ${index ? "border-t border-border" : ""}`} onPress={() => router.push(`/legal/${document.id}`)}>
                <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
                  <FileLock2 color={colors.primary} size={20} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-vietnam text-body-emphasis text-ink">{document.shortTitle}</Text>
                  <Text numberOfLines={1} className="mt-0.5 font-vietnam text-body-sm text-muted">{accepted ? "Đã ghi nhận đã đọc" : `Phiên bản ${document.version}`}</Text>
                </View>
                <ChevronRight color={colors.muted} size={18} />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-8 rounded-xl border border-card-border bg-surface p-4">
          <View className="flex-row items-center gap-2">
            <ShieldCheck color={colors.primary} size={21} />
            <Text className="font-vietnam text-title-md text-ink">Quyền dữ liệu cá nhân</Text>
          </View>
          <Text className="mt-2 font-vietnam text-body-md text-muted">Gửi yêu cầu truy cập, chỉnh sửa hoặc xoá dữ liệu. Bạn cũng có thể liên hệ {LEGAL_CONTACT_PLACEHOLDER}.</Text>
          {requests.length ? <Text className="mt-3 font-vietnam text-body-sm text-secondary">Bạn có {requests.length} yêu cầu đang chờ xử lý trên thiết bị này.</Text> : null}
          <PrimaryBtn className="mt-4" fullWidth title="Gửi yêu cầu về dữ liệu" onPress={() => setRequestOpen(true)} />
        </View>
      </ScrollView>
      {requestOpen ? <PrivacyRequestSheet onClose={() => { setRequestOpen(false); refresh(); }} /> : null}
    </SafeAreaView>
  );
}
