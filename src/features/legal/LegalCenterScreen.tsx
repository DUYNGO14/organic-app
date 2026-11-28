import { useAppTranslation } from "@/localization/content";
import { IconButton, PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { requestSignIn } from "@/features/auth/member-access";
import { useAppColors } from "@/hooks/use-app-colors";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, FileLock2, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEGAL_CONTACT_PLACEHOLDER, LEGAL_DRAFT_NOTICE, legalDocuments } from "./legal.data";
import { getLegalAcceptances, getLegalAccount, getPrivacyRequests } from "./legal.service";
import type { LegalAcceptance, PrivacyRequest } from "./legal.types";
import { PrivacyRequestSheet } from "./PrivacyRequestSheet";

export function LegalCenterScreen() {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const account = useAuthStore((state) => getLegalAccount(state.session));
  const [acceptances, setAcceptances] = useState<LegalAcceptance[]>([]);
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);

  const refresh = useCallback(() => {
    if (!account) return;
    void Promise.all([getLegalAcceptances(account), getPrivacyRequests(account)]).then(([nextAcceptances, nextRequests]) => {
      if (getLegalAccount(useAuthStore.getState().session) !== account) return;
      setAcceptances(nextAcceptances);
      setRequests(nextRequests);
    });
  }, [account]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <View className="min-h-14 flex-row items-center border-b border-border bg-surface px-3">
        <IconButton icon={<ChevronLeft color={colors.ink} size={22} />} label={t("common.back")} onPress={() => router.back()} />
        <Text className="ml-1 flex-1 font-vietnam text-title-md text-ink">{t("legal.legalCenter")}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-warning/30 bg-warning-container p-4">
          <Text className="font-vietnam text-label-lg text-warning">{t("legal.documentUnpublished")}</Text>
          <Text className="mt-1 font-vietnam text-body-sm text-warning">{localize(LEGAL_DRAFT_NOTICE)}</Text>
        </View>

        <Text className="mt-6 font-vietnam text-headline-sm text-ink">{t("legal.policiesAndTerms")}</Text>
        <Text className="mt-1 font-vietnam text-body-md text-muted">{t("legal.reviewEachDocumentSVersionEffective")}</Text>
        <View className="mt-4 overflow-hidden rounded-xl border border-card-border bg-surface">
          {legalDocuments.map((document, index) => {
            const accepted = account && acceptances.find((item) => item.documentId === document.id && item.version === document.version);
            return (
              <Pressable key={document.id} className={`min-h-20 flex-row items-center gap-3 px-4 py-3 active:bg-surface-soft ${index ? "border-t border-border" : ""}`} onPress={() => router.push(`/legal/${document.id}`)}>
                <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
                  <FileLock2 color={colors.primary} size={20} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-vietnam text-body-emphasis text-ink">{localize(document.shortTitle)}</Text>
                  <Text numberOfLines={1} className="mt-0.5 font-vietnam text-body-sm text-muted">{accepted ? t("legal.acknowledged") : t("auth.version", { appVersion: localize(document.version) })}</Text>
                </View>
                <ChevronRight color={colors.muted} size={18} />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-8 rounded-xl border border-card-border bg-surface p-4">
          <View className="flex-row items-center gap-2">
            <ShieldCheck color={colors.primary} size={21} />
            <Text className="font-vietnam text-title-md text-ink">{t("legal.personalDataRights")}</Text>
          </View>
          <Text className="mt-2 font-vietnam text-body-md text-muted">{t("legal.requestAccessCorrectionOrDeletionOf", { legalContactPlaceholder: localize(LEGAL_CONTACT_PLACEHOLDER) })}</Text>
          {account && requests.length ? <Text className="mt-3 font-vietnam text-body-sm text-secondary">{t("legal.youHavePendingRequestsOnThis", { count: requests.length })}</Text> : null}
          <PrimaryBtn className="mt-4" fullWidth title={t("legal.submitADataRequest")} onPress={() => requestSignIn(() => setRequestOpen(true))} />
        </View>
      </ScrollView>
      {account && requestOpen ? <PrivacyRequestSheet onClose={() => { setRequestOpen(false); refresh(); }} /> : null}
    </SafeAreaView>
  );
}
