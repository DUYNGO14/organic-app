import { useTranslation } from "react-i18next";
import {
  Checkbox,
  FieldFrame,
  Input,
  PhoneInput,
  PrimaryBtn,
} from "@/components/common";
import { SheetTextInput } from "@/components/common/Input/SheetTextInput";
import type { DivisionLevel, DivisionMode } from "@/features/cart/address-divisions";
import type { DeliveryAddress } from "@/features/cart/cart.store";
import { resolveLocationAddress } from "@/features/cart/location-address";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import * as Location from "expo-location";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  House,
  LocateFixed,
  MapPin,
  Tag,
  UserRound,
} from "lucide-react-native";
import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Keyboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextInputProps,
} from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { z } from "zod";
import { SheetFooter } from "@/components/common/BottomSheet";
import { AddressDivisionPicker, divisionLabelKeys } from "./AddressDivisionPicker";

const addressSchema = z.object({
  name: z.string().trim().min(2, "cart.enterTheRecipientSName"),
  phone: z
    .string()
    .transform((value) =>
      value.replace(/[^\d+]/g, "").replace(/^(?:\+84|0084|0)/, ""),
    )
    .pipe(
      z
        .string()
        .regex(
          /^[35789]\d{8}$/,
          "cart.enterAValidVietnamesePhoneNumber",
        ),
    ),
  province: z.string().trim().min(2, "cart.enterTheProvinceOrCity"),
  district: z.string().trim(),
  divisionMode: z.enum(["current", "legacy"]),
  ward: z.string().trim().min(2, "cart.enterTheWardOrCommune"),
  address: z.string().trim().min(5, "cart.enterYourCompleteDeliveryAddress"),
  label: z.enum(["home", "office"]),
  note: z.string().trim().max(240, "cart.keepTheNoteTo240Characters"),
  makeDefault: z.boolean(),
}).refine((values) => values.divisionMode === "current" || values.district.length > 0, {
  path: ["district"],
  message: "cart.chooseADistrict",
});

type AddressFormValues = z.input<typeof addressSchema>;
type AddressTextField = "name" | "address" | "note";
const addressLabels = [
  { value: "home", title: "cart.home", Icon: House },
  { value: "office", title: "cart.office", Icon: Building2 },
] as const;
const quickNotes = [
  "cart.deliverDuringBusinessHours",
  "cart.call15MinutesAhead",
  "cart.leaveWithReceptionOrSecurity",
];

function AddressFormSection({
  title,
  icon,
  children,
}: PropsWithChildren<{ title: string; icon: ReactNode }>) {
  return (
    <View className="gap-4 rounded-lg border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text
          accessibilityRole="header"
          className="flex-1 font-vietnam text-body-emphasis text-ink"
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function DeliveryAddressForm({
  address,
  isDefault,
  onSave,
}: {
  address: DeliveryAddress | null;
  isDefault: boolean;
  onSave: (address: DeliveryAddress, makeDefault: boolean) => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AddressFormValues>({
    defaultValues: {
      name: address?.name ?? "",
      phone: address?.phone ?? "",
      address: address?.address ?? "",
      province: address?.province ?? "",
      district: address?.district ?? "",
      divisionMode: address?.divisionMode ?? (address?.district ? "legacy" : "current"),
      ward: address?.ward ?? "",
      label: address?.label ?? "home",
      note: address?.note ?? "",
      makeDefault: isDefault,
    },
  });
  const [locating, setLocating] = useState(false);
  const [coordinates, setCoordinates] =
    useState<Location.LocationObjectCoords | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const locationRequest = useRef<AbortController | null>(null);
  const [pickerLevel, setPickerLevel] = useState<DivisionLevel | null>(null);
  const [province, district, ward, divisionMode] = useWatch({
    control,
    name: ["province", "district", "ward", "divisionMode"],
  });
  const firstError = Object.values(errors)[0]?.message;

  useEffect(() => () => {
    locationRequest.current?.abort();
  }, []);

  const submit = handleSubmit((values) => {
    const result = addressSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach(({ path, message }) => {
        setError(path[0] as keyof AddressFormValues, { message });
      });
      return;
    }
    const { makeDefault, ...address } = result.data;
    Keyboard.dismiss();
    onSave(address, makeDefault);
  });

  function selectDivision(level: DivisionLevel, name: string, mode: DivisionMode) {
    if (level === "province" && (name !== province || mode !== divisionMode)) {
      setValue("divisionMode", mode, { shouldDirty: true });
      setValue("district", "");
      setValue("ward", "");
      clearErrors(["district", "ward"]);
    } else if (level === "district" && name !== district) {
      setValue("ward", "");
      clearErrors("ward");
    }
    setValue(level, name, { shouldDirty: true });
    clearErrors(level);
  }

  function renderDivision(level: DivisionLevel, value: string) {
    const helperText = level === "district" && divisionMode === "current"
      ? t("cart.chooseTheAddressFormatWithA")
      : level !== "province" && !province
        ? t("cart.chooseAProvinceOrCityFirst")
        : level === "ward" && divisionMode === "legacy" && !district
          ? t("cart.chooseADistrictFirst")
          : undefined;
    const label = t(divisionLabelKeys[level]);
    return (
      <FieldFrame label={label} required={level !== "district" || divisionMode === "legacy"} error={errors[level]?.message ? t(errors[level].message) : undefined} helperText={helperText}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `${label}: ${value}` : t("cart.select2", { productLabel: label })}
          accessibilityState={{ disabled: locating || Boolean(helperText) }}
          disabled={locating || Boolean(helperText)}
          className={cn("min-h-12 flex-row items-center gap-2 rounded border bg-surface-soft px-4 py-2 active:bg-surface-container", errors[level] ? "border-danger" : "border-border")}
          onPress={() => {
            Keyboard.dismiss();
            setPickerLevel(level);
          }}
        >
          <Text className={cn("flex-1 font-vietnam text-body-md", value ? "text-ink" : "text-muted")}>
            {value || t("cart.select2", { productLabel: label.toLocaleLowerCase("vi-VN") })}
          </Text>
          <ChevronRight color={colors.muted} size={19} />
        </Pressable>
      </FieldFrame>
    );
  }

  function renderField(
    name: AddressTextField,
    label: string,
    props: TextInputProps = {},
  ) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Input
            {...props}
            inputComponent={SheetTextInput}
            inputClassName="bg-surface-soft"
            label={label}
            required={name !== "note"}
            error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
            onBlur={field.onBlur}
            onChangeText={(value) => {
              if (fieldState.error) clearErrors(name);
              field.onChange(value);
            }}
            value={field.value}
          />
        )}
      />
    );
  }

  async function locateAddress() {
    if (locationRequest.current) return;
    const request = new AbortController();
    const { signal } = request;
    locationRequest.current = request;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    Keyboard.dismiss();
    setLocating(true);
    setLocationMessage("");
    setShowLocationSettings(false);
    setCoordinates(null);
    try {
      const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (signal.aborted) return;
      if (!granted) {
        setShowLocationSettings(!canAskAgain);
        setLocationMessage(canAskAgain
          ? t("cart.allowLocationAccessToFillIn")
          : t("cart.enableLocationAccessForThisApp"));
        return;
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (signal.aborted) return;
      if (!servicesEnabled) {
        setLocationMessage(t("cart.turnOnLocationServicesAndTry"));
        return;
      }
      timeout = setTimeout(() => {
        request.abort();
        locationRequest.current = null;
        setLocating(false);
        setLocationMessage(t("cart.findingYourAddressTookTooLong"));
      }, 35_000);
      signal.addEventListener("abort", () => clearTimeout(timeout), { once: true });

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (signal.aborted) return;
      setCoordinates(coords);
      const [place] = await Location.reverseGeocodeAsync(coords);
      if (signal.aborted) return;
      const fields = place && await resolveLocationAddress(place, getValues("divisionMode"), signal);
      if (signal.aborted) return;
      if (!fields || (!fields.province && !fields.address)) {
        setLocationMessage(t("cart.weFoundYourLocationButCouldn"));
        return;
      }
      const addressFields = ["divisionMode", "province", "district", "ward", "address"] as const;
      for (const field of addressFields) {
        setValue(field, fields[field], { shouldDirty: true });
      }
      clearErrors([...addressFields]);
      const hasFullAddress = fields.ward && fields.address.length >= 5
        && (fields.divisionMode === "current" || fields.district);
      setLocationMessage(hasFullAddress
        ? t("cart.weFilledInTheAddressFrom")
        : t("cart.weFilledInPartOfThe"));
    } catch {
      if (!signal.aborted) {
        setLocationMessage(t("cart.couldNotFindAnAddressFrom"));
      }
    } finally {
      clearTimeout(timeout);
      if (locationRequest.current === request && !signal.aborted) {
        locationRequest.current = null;
        setLocating(false);
      }
    }
  }

  function openMap() {
    if (!coordinates) return;
    const query = encodeURIComponent(
      `${coordinates.latitude},${coordinates.longitude}`,
    );
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    ).catch(() => setLocationMessage(t("cart.couldNotOpenMapsOnThis")));
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, minHeight: 0 }}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="gap-4">
          <AddressFormSection
            title={t("cart.recipientDetails")}
            icon={<UserRound color={colors.primary} size={20} />}
          >
            {renderField("name", t("auth.fullName"), {
              autoComplete: "name",
              placeholder: t("cart.recipientName"),
            })}
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <PhoneInput
                  required
                  inputComponent={SheetTextInput}
                  label={t("common.phoneNumber")}
                  error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                  onBlur={field.onBlur}
                  onChangeText={(value) => {
                    clearErrors("phone");
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              )}
            />
          </AddressFormSection>

          <AddressFormSection
            title={t("cart.produceDeliveryAddress")}
            icon={<MapPin color={colors.primary} size={20} />}
          >
            {Platform.OS !== "web" ? (
              <NativeViewGestureHandler disallowInterruption>
                <View className="gap-2 rounded bg-primary/10 p-3">
                  <PrimaryBtn
                    variant="secondary"
                    title={
                      locating ? t("cart.gettingYourLocation") : t("cart.useCurrentLocation")
                    }
                    disabled={locating}
                    leadingIcon={
                      <LocateFixed color={colors.primary} size={19} />
                    }
                    onPress={() => void locateAddress()}
                  />
                  {locationMessage ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      className="font-vietnam text-body-sm text-muted"
                    >
                      {locationMessage}
                    </Text>
                  ) : null}
                  {showLocationSettings ? (
                    <PrimaryBtn
                      variant="ghost"
                      title={t("cart.openAppSettings")}
                      onPress={() => void Linking.openSettings().catch(() => {
                        setLocationMessage(t("cart.couldNotOpenAppSettingsOn"));
                      })}
                    />
                  ) : null}
                  {coordinates ? (
                    <PrimaryBtn
                      variant="ghost"
                      title={t("cart.viewLocationOnMap")}
                      onPress={openMap}
                    />
                  ) : null}
                </View>
              </NativeViewGestureHandler>
            ) : null}
            {renderDivision("province", province)}
            {renderDivision("district", district)}
            {renderDivision("ward", ward)}
            {renderField("address", t("cart.streetBuildingAndHouseNumber"), {
              placeholder: t("cart.enterTheFullStreetAddress"),
              autoComplete: "street-address",
              editable: !locating,
              multiline: true,
              textAlignVertical: "top",
            })}
          </AddressFormSection>

          <AddressFormSection
            title={t("cart.addressPreferencesAndLabels")}
            icon={<Tag color={colors.primary} size={20} />}
          >
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <View className="flex-row flex-wrap gap-2">
                  {addressLabels.map(({ value, title, Icon }) => {
                    const checked = field.value === value;
                    return (
                      <NativeViewGestureHandler
                        key={value}
                        disallowInterruption
                      >
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ checked }}
                          className={cn(
                            "min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full px-3 py-2",
                            checked ? "bg-primary" : "bg-surface-container",
                          )}
                          onPress={() => field.onChange(value)}
                        >
                          <Icon
                            color={checked ? colors.onPrimary : colors.primary}
                            size={18}
                          />
                          <Text
                            className={cn(
                              "font-vietnam text-label-md",
                              checked ? "text-on-primary" : "text-ink",
                            )}
                          >
                            {t(title)}
                          </Text>
                        </Pressable>
                      </NativeViewGestureHandler>
                    );
                  })}
                </View>
              )}
            />
            {renderField("note", t("cart.deliveryNotes"), {
              placeholder: t("cart.forExampleLeaveWithReceptionOn"),
              maxLength: 240,
              multiline: true,
            })}
            <View className="flex-row flex-wrap gap-2">
              {quickNotes.map((key) => t(key)).map((note) => (
                <NativeViewGestureHandler key={note} disallowInterruption>
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-12 justify-center rounded-full bg-surface-container px-3"
                    onPress={() => {
                      const parts = getValues("note")
                        .split(" · ")
                        .map((part) => part.trim())
                        .filter(Boolean);
                      if (!parts.includes(note))
                        setValue(
                          "note",
                          [...parts, note].join(" · ").slice(0, 240),
                        );
                    }}
                  >
                    <Text className="font-vietnam text-label-md text-primary">
                      {note}
                    </Text>
                  </Pressable>
                </NativeViewGestureHandler>
              ))}
            </View>
            <Controller
              control={control}
              name="makeDefault"
              render={({ field }) => (
                <NativeViewGestureHandler disallowInterruption>
                  <View>
                    <Checkbox
                      checked={field.value}
                      disabled={isDefault}
                      label={
                        isDefault
                          ? t("cart.defaultAddress")
                          : t("cart.setAsDefaultAddress")
                      }
                      onCheckedChange={field.onChange}
                    />
                  </View>
                </NativeViewGestureHandler>
              )}
            />
          </AddressFormSection>
        </View>
      </ScrollView>
      <SheetFooter guardGesture>
        {firstError ? (
          <Text
            accessibilityRole="alert"
            className="font-vietnam text-body-sm text-danger"
          >
            {t(firstError)}
          </Text>
        ) : null}
        <PrimaryBtn
          fullWidth
          title={t("cart.saveAddress")}
          disabled={locating}
          leadingIcon={<CheckCircle2 color={colors.onPrimary} size={20} />}
          onPress={() => {
            if (!locationRequest.current) void submit();
          }}
        />
      </SheetFooter>
      {pickerLevel ? (
        <AddressDivisionPicker
          level={pickerLevel}
          initialMode={divisionMode}
          province={province}
          district={district}
          value={{ province, district, ward }[pickerLevel]}
          onSelect={(name, mode) => selectDivision(pickerLevel, name, mode)}
          onClose={() => setPickerLevel(null)}
        />
      ) : null}
    </>
  );
}
