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
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
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
  Text,
  View,
  type TextInputProps,
} from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { z } from "zod";
import { SheetFooter } from "@/components/common/BottomSheet";
import { AddressDivisionPicker, divisionLabels } from "./AddressDivisionPicker";

const addressSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên người nhận."),
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
          "Vui lòng nhập số điện thoại Việt Nam hợp lệ.",
        ),
    ),
  province: z.string().trim().min(2, "Vui lòng nhập tỉnh hoặc thành phố."),
  district: z.string().trim(),
  divisionMode: z.enum(["current", "legacy"]),
  ward: z.string().trim().min(2, "Vui lòng nhập phường hoặc xã."),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ nhận hàng đầy đủ."),
  label: z.enum(["home", "office"]),
  note: z.string().trim().max(240, "Ghi chú tối đa 240 ký tự."),
  makeDefault: z.boolean(),
}).refine((values) => values.divisionMode === "current" || values.district.length > 0, {
  path: ["district"],
  message: "Vui lòng chọn quận hoặc huyện.",
});

type AddressFormValues = z.input<typeof addressSchema>;
type AddressTextField = "name" | "address" | "note";
const addressLabels = [
  { value: "home", title: "Nhà riêng", Icon: House },
  { value: "office", title: "Văn phòng", Icon: Building2 },
] as const;
const quickNotes = [
  "Giao giờ hành chính",
  "Gọi trước 15 phút",
  "Gửi lễ tân / bảo vệ",
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
      ? "Chọn địa chỉ có quận/huyện ở mục Tỉnh / Thành phố."
      : level !== "province" && !province
        ? "Chọn tỉnh hoặc thành phố trước."
        : level === "ward" && divisionMode === "legacy" && !district
          ? "Chọn quận hoặc huyện trước."
          : undefined;
    const label = divisionLabels[level];
    return (
      <FieldFrame label={label} required={level !== "district" || divisionMode === "legacy"} error={errors[level]?.message} helperText={helperText}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `${label}: ${value}` : `Chọn ${label}`}
          accessibilityState={{ disabled: locating || Boolean(helperText) }}
          disabled={locating || Boolean(helperText)}
          className={cn("min-h-12 flex-row items-center gap-2 rounded border bg-surface-soft px-4 py-2 active:bg-surface-container", errors[level] ? "border-danger" : "border-border")}
          onPress={() => {
            Keyboard.dismiss();
            setPickerLevel(level);
          }}
        >
          <Text className={cn("flex-1 font-vietnam text-body-md", value ? "text-ink" : "text-muted")}>
            {value || `Chọn ${label.toLocaleLowerCase("vi-VN")}`}
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
            error={fieldState.error?.message}
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
          ? "Cho phép truy cập vị trí để tự điền địa chỉ nhận hàng."
          : "Bật quyền vị trí cho ứng dụng trong Cài đặt để dùng tính năng này.");
        return;
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (signal.aborted) return;
      if (!servicesEnabled) {
        setLocationMessage("Hãy bật dịch vụ vị trí trên thiết bị rồi thử lại.");
        return;
      }
      timeout = setTimeout(() => {
        request.abort();
        locationRequest.current = null;
        setLocating(false);
        setLocationMessage("Lấy địa chỉ mất quá nhiều thời gian. Bạn có thể thử lại.");
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
        setLocationMessage("Đã lấy vị trí nhưng chưa tìm được địa chỉ nhận hàng. Hãy kiểm tra trên bản đồ hoặc nhập địa chỉ.");
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
        ? "Đã điền địa chỉ theo vị trí. Hãy kiểm tra lại số nhà và tên đường trước khi lưu."
        : "Đã điền phần địa chỉ tìm được. Hãy bổ sung các mục còn thiếu trước khi lưu.");
    } catch {
      if (!signal.aborted) {
        setLocationMessage("Không thể lấy địa chỉ từ vị trí. Hãy thử lại hoặc nhập địa chỉ.");
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
    ).catch(() => setLocationMessage("Không thể mở bản đồ trên thiết bị này."));
  }

  return (
    <>
      <BottomSheetScrollView
        style={{ flex: 1, minHeight: 0 }}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="gap-4">
          <AddressFormSection
            title="Thông tin người nhận"
            icon={<UserRound color={colors.primary} size={20} />}
          >
            {renderField("name", "Họ và tên", {
              autoComplete: "name",
              placeholder: "Tên người nhận",
            })}
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <PhoneInput
                  required
                  inputComponent={SheetTextInput}
                  label="Số điện thoại"
                  error={fieldState.error?.message}
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
            title="Địa chỉ nhận nông sản"
            icon={<MapPin color={colors.primary} size={20} />}
          >
            {Platform.OS !== "web" ? (
              <NativeViewGestureHandler disallowInterruption>
                <View className="gap-2 rounded bg-primary/10 p-3">
                  <PrimaryBtn
                    variant="secondary"
                    title={
                      locating ? "Đang lấy vị trí…" : "Dùng vị trí hiện tại"
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
                      title="Mở cài đặt ứng dụng"
                      onPress={() => void Linking.openSettings().catch(() => {
                        setLocationMessage("Không thể mở cài đặt ứng dụng trên thiết bị này.");
                      })}
                    />
                  ) : null}
                  {coordinates ? (
                    <PrimaryBtn
                      variant="ghost"
                      title="Xem vị trí trên bản đồ"
                      onPress={openMap}
                    />
                  ) : null}
                </View>
              </NativeViewGestureHandler>
            ) : null}
            {renderDivision("province", province)}
            {renderDivision("district", district)}
            {renderDivision("ward", ward)}
            {renderField("address", "Tên đường, tòa nhà, số nhà", {
              placeholder: "Nhập địa chỉ cụ thể",
              autoComplete: "street-address",
              editable: !locating,
              multiline: true,
              textAlignVertical: "top",
            })}
          </AddressFormSection>

          <AddressFormSection
            title="Cài đặt và nhãn địa chỉ"
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
                            {title}
                          </Text>
                        </Pressable>
                      </NativeViewGestureHandler>
                    );
                  })}
                </View>
              )}
            />
            {renderField("note", "Ghi chú giao hàng", {
              placeholder: "Ví dụ: Gửi lễ tân ở tầng trệt",
              maxLength: 240,
              multiline: true,
            })}
            <View className="flex-row flex-wrap gap-2">
              {quickNotes.map((note) => (
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
                          ? "Địa chỉ mặc định"
                          : "Đặt làm địa chỉ mặc định"
                      }
                      onCheckedChange={field.onChange}
                    />
                  </View>
                </NativeViewGestureHandler>
              )}
            />
          </AddressFormSection>
        </View>
      </BottomSheetScrollView>
      <SheetFooter guardGesture>
        {firstError ? (
          <Text
            accessibilityRole="alert"
            className="font-vietnam text-body-sm text-danger"
          >
            {firstError}
          </Text>
        ) : null}
        <PrimaryBtn
          fullWidth
          title="Hoàn thành & lưu địa chỉ"
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
