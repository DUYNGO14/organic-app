import { IconButton, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, FileText, ShieldAlert } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { LEGAL_DRAFT_NOTICE, getLegalDocument } from "./legal.data";
import { acceptLegalDocuments, getLegalAcceptances, getLegalAccount } from "./legal.service";
import type { LegalAcceptance } from "./legal.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function LegalDocumentScreen() {
  const { document: documentId } = useLocalSearchParams<{ document?: string }>();
  const document = getLegalDocument(documentId);
  const colors = useAppColors();
  const account = useAuthStore((state) => getLegalAccount(state.session));
  const [acceptance, setAcceptance] = useState<LegalAcceptance | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!account || !document) return;
    void getLegalAcceptances(account).then((items) => {
      setAcceptance(items.find((item) => item.documentId === document.id && item.version === document.version) ?? null);
    });
  }, [document, account]);

  async function accept() {
    if (!account || !document) {
      Toast.show({ type: "info", text1: "Đăng nhập để ghi nhận", text2: "Bạn vẫn có thể đọc tài liệu này mà không cần đăng nhập." });
      return;
    }
    setSaving(true);
    try {
      const items = await acceptLegalDocuments(account, [document.id], "legal-center");
      setAcceptance(items.find((item) => item.documentId === document.id) ?? null);
      Toast.show({ type: "success", text1: "Đã ghi nhận", text2: `Bạn đã đọc ${document.shortTitle}.` });
    } finally {
      setSaving(false);
    }
  }

  if (!document) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas px-6" edges={["top", "bottom"]}>
        <FileText color={colors.muted} size={32} />
        <Text className="mt-3 text-center font-vietnam text-title-md text-ink">Không tìm thấy tài liệu</Text>
        <PrimaryBtn className="mt-5" title="Về Trung tâm pháp lý" onPress={() => router.replace("/legal")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <View className="min-h-14 flex-row items-center border-b border-border bg-surface px-3">
        <IconButton icon={<ArrowLeft color={colors.ink} size={21} />} label="Quay lại" onPress={() => router.back()} />
        <Text numberOfLines={1} className="ml-1 flex-1 font-vietnam text-title-md text-ink">{document.shortTitle}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-warning/30 bg-warning-container p-4">
          <View className="flex-row items-start gap-2">
            <ShieldAlert color={colors.warning} size={20} />
            <View className="min-w-0 flex-1">
              <Text className="font-vietnam text-label-lg text-warning">Bản dự thảo nội bộ</Text>
              <Text className="mt-1 font-vietnam text-body-sm text-warning">{LEGAL_DRAFT_NOTICE}</Text>
            </View>
          </View>
        </View>
        <Text accessibilityRole="header" className="mt-6 font-vietnam text-headline-md text-ink">{document.title}</Text>
        <Text className="mt-2 font-vietnam text-body-md text-muted">Phiên bản {document.version} · Hiệu lực: {document.effectiveDate}</Text>
        {document.sections.map((section) => (
          <View key={section.heading} className="mt-6">
            <Text className="font-vietnam text-title-md text-ink">{section.heading}</Text>
            {section.paragraphs?.map((paragraph) => <Text key={paragraph} className="mt-2 font-vietnam text-body-md text-muted">{paragraph}</Text>)}
            {section.bullets?.map((bullet) => (
              <View key={bullet} className="mt-2 flex-row gap-2">
                <Text className="font-vietnam text-body-md text-primary">•</Text>
                <Text className="min-w-0 flex-1 font-vietnam text-body-md text-muted">{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
        {acceptance ? (
          <View className="mt-8 flex-row items-center gap-2 rounded-lg bg-secondary-container/40 p-4">
            <CheckCircle2 color={colors.secondary} size={20} />
            <Text className="min-w-0 flex-1 font-vietnam text-body-sm text-on-secondary-container">Đã ghi nhận bạn đọc phiên bản này lúc {formatDate(acceptance.acceptedAt)}.</Text>
          </View>
        ) : (
          <PrimaryBtn className="mt-8" fullWidth loading={saving} title="Tôi đã đọc tài liệu này" onPress={() => void accept()} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
