import { useAppTranslation } from "@/localization/content";
import { getFormattingLocale } from "@/localization";
import { IconButton, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { requestSignIn } from "@/features/auth/member-access";
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
  return new Intl.DateTimeFormat(getFormattingLocale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function LegalDocumentScreen() {
  const { t, localize } = useAppTranslation();
  const { document: documentId } = useLocalSearchParams<{ document?: string }>();
  const document = getLegalDocument(documentId);
  const colors = useAppColors();
  const account = useAuthStore((state) => getLegalAccount(state.session));
  const [acceptance, setAcceptance] = useState<LegalAcceptance | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!account || !document) return;
    let active = true;
    void getLegalAcceptances(account).then((items) => {
      if (active) setAcceptance(items.find((item) => item.documentId === document.id && item.version === document.version) ?? null);
    });
    return () => { active = false; };
  }, [document, account]);

  async function accept() {
    if (!account || !document) return;
    setSaving(true);
    try {
      const items = await acceptLegalDocuments(account, [document.id], "legal-center");
      setAcceptance(items.find((item) => item.documentId === document.id) ?? null);
      Toast.show({ type: "success", text1: t("legal.acknowledgmentSaved"), text2: t("legal.youAcknowledged", { shortTitle: localize(document.shortTitle) }) });
    } finally {
      setSaving(false);
    }
  }

  if (!document) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas px-6" edges={["top", "bottom"]}>
        <FileText color={colors.muted} size={32} />
        <Text className="mt-3 text-center font-vietnam text-title-md text-ink">{t("legal.documentNotFound")}</Text>
        <PrimaryBtn className="mt-5" title={t("legal.backToLegalCenter")} onPress={() => router.replace("/legal")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <View className="min-h-14 flex-row items-center border-b border-border bg-surface px-3">
        <IconButton icon={<ArrowLeft color={colors.ink} size={21} />} label={t("common.back")} onPress={() => router.back()} />
        <Text numberOfLines={1} className="ml-1 flex-1 font-vietnam text-title-md text-ink">{localize(document.shortTitle)}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-warning/30 bg-warning-container p-4">
          <View className="flex-row items-start gap-2">
            <ShieldAlert color={colors.warning} size={20} />
            <View className="min-w-0 flex-1">
              <Text className="font-vietnam text-label-lg text-warning">{t("legal.internalDraft")}</Text>
              <Text className="mt-1 font-vietnam text-body-sm text-warning">{localize(LEGAL_DRAFT_NOTICE)}</Text>
            </View>
          </View>
        </View>
        <Text accessibilityRole="header" className="mt-6 font-vietnam text-headline-md text-ink">{localize(document.title)}</Text>
        <Text className="mt-2 font-vietnam text-body-md text-muted">{t("legal.versionEffective", { version: localize(document.version), effectiveDate: localize(document.effectiveDate) })}</Text>
        {document.sections.map((section) => (
          <View key={localize(section.heading)} className="mt-6">
            <Text className="font-vietnam text-title-md text-ink">{localize(section.heading)}</Text>
            {section.paragraphs?.map((paragraph) => <Text key={localize(paragraph)} className="mt-2 font-vietnam text-body-md text-muted">{localize(paragraph)}</Text>)}
            {section.bullets?.map((bullet) => (
              <View key={localize(bullet)} className="mt-2 flex-row gap-2">
                <Text className="font-vietnam text-body-md text-primary">•</Text>
                <Text className="min-w-0 flex-1 font-vietnam text-body-md text-muted">{localize(bullet)}</Text>
              </View>
            ))}
          </View>
        ))}
        {account && acceptance ? (
          <View className="mt-8 flex-row items-center gap-2 rounded-lg bg-secondary-container/40 p-4">
            <CheckCircle2 color={colors.secondary} size={20} />
            <Text className="min-w-0 flex-1 font-vietnam text-body-sm text-on-secondary-container">{t("legal.youAcknowledgedThisVersionOn", { value: formatDate(acceptance.acceptedAt) })}</Text>
          </View>
        ) : (
          <PrimaryBtn
            className="mt-8"
            fullWidth
            loading={saving}
            title={t(account ? "legal.iVeReadThisDocument" : "legal.signInToAcknowledge")}
            onPress={() => account ? void accept() : requestSignIn()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
