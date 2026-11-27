import { useTranslation } from "react-i18next";
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
import { createPrivacyRequest, getLegalAccount } from "./legal.service";
import type { PrivacyRequestKind } from "./legal.types";

const requestKinds: readonly { id: PrivacyRequestKind; label: string }[] = [
  { id: "access", label: "legal.accessData" },
  { id: "correct", label: "legal.correctData" },
  { id: "delete", label: "legal.deleteData" },
  { id: "other", label: "legal.other" },
];

export function PrivacyRequestSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const sheet = useRef<AppSheetHandle>(null);
  const colors = useAppColors();
  const account = useAuthStore((state) => getLegalAccount(state.session));
  const [kind, setKind] = useState<PrivacyRequestKind>("access");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!account) {
      Toast.show({ type: "error", text1: t("legal.signInRequired"), text2: t("legal.signInToSubmitAData") });
      return;
    }
    setSubmitting(true);
    try {
      await createPrivacyRequest(account, kind, note);
      Toast.show({ type: "success", text1: t("legal.requestRecorded"), text2: t("legal.yourRequestIsPendingReview") });
      sheet.current?.dismiss();
    } catch {
      Toast.show({ type: "error", text1: t("legal.couldNotSubmitTheRequest"), text2: t("legal.pleaseTryAgainLater") });
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
        title: t("legal.personalDataRequest"),
        subtitle: t("legal.thisRecordIsStoredOnYour"),
      }}
      onDismiss={onClose}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text className="mb-2 font-vietnam text-label-md text-ink">{t("legal.requestType")}</Text>
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
                  <Text className={`font-vietnam text-label-md ${selected ? "text-on-primary" : "text-ink"}`}>{t(item.label)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View>
          <Text className="mb-2 font-vietnam text-label-md text-ink">{t("legal.additionalInformation")}</Text>
          <SheetTextInput
            accessibilityLabel={t("legal.additionalDetailsForYourDataRequest")}
            className="min-h-28 rounded-lg border border-border bg-surface px-3 py-3 align-top font-vietnam text-body-md text-ink"
            multiline
            maxLength={500}
            placeholder={t("legal.forExampleWhichDataYouWant")}
            placeholderTextColor={colors.muted}
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
          <Text className="mt-2 font-vietnam text-body-sm text-muted">{t("legal.leavePasswordsVerificationCodesAndPayment")}</Text>
        </View>
      </BottomSheetScrollView>
      <SheetFooter guardGesture>
        <PrimaryBtn fullWidth loading={submitting} title={t("legal.submitRequest")} trailingIcon={<Send color={colors.onPrimary} size={18} />} onPress={() => void submit()} />
      </SheetFooter>
    </AppSheet>
  );
}
