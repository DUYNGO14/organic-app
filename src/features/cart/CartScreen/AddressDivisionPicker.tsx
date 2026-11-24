import { AppSheet, SheetFooter, type AppSheetHandle } from "@/components/common/BottomSheet";
import { PrimaryBtn, SearchInput } from "@/components/common";
import { SheetTextInput } from "@/components/common/Input/SheetTextInput";
import {
  fetchProvinces,
  fetchSubdivisions,
  findDivision,
  normalizeDivision,
  type DivisionLevel,
  type DivisionMode,
} from "@/features/cart/address-divisions";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, type ScrollViewProps } from "react-native";

export const divisionLabels: Record<DivisionLevel, string> = {
  province: "Tỉnh / Thành phố",
  district: "Quận / Huyện",
  ward: "Phường / Xã",
};

const snapPoints = ["88%"];
const modes = [
  { id: "current", title: "Địa chỉ hiện hành" },
  { id: "legacy", title: "Địa chỉ có quận/huyện" },
] as const;
const queryOptions = { staleTime: 60 * 60 * 1000, retry: false } as const;

export function AddressDivisionPicker({
  level,
  initialMode,
  province,
  district,
  value,
  onSelect,
  onClose,
}: {
  level: DivisionLevel;
  initialMode: DivisionMode;
  province: string;
  district: string;
  value: string;
  onSelect: (name: string, mode: DivisionMode) => void;
  onClose: () => void;
}) {
  const ref = useRef<AppSheetHandle>(null);
  const colors = useAppColors();
  const [mode, setMode] = useState(initialMode);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [manual, setManual] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const renderScrollComponent = useBottomSheetScrollableCreator<ScrollViewProps>();
  const provinces = useQuery({
    ...queryOptions,
    queryKey: ["address-divisions", mode, "provinces"],
    queryFn: ({ signal }) => fetchProvinces(mode, signal),
    enabled: !manual,
  });
  const provinceCode = findDivision(provinces.data ?? [], province)?.code;
  const provinceChildren = useQuery({
    ...queryOptions,
    queryKey: ["address-divisions", mode, "province", provinceCode],
    queryFn: ({ signal }) => fetchSubdivisions(mode, "province", provinceCode!, signal),
    enabled: !manual && level !== "province" && provinceCode !== undefined,
  });
  const usesDistrict = level === "ward" && mode === "legacy";
  const districtCode = usesDistrict ? findDivision(provinceChildren.data ?? [], district)?.code : undefined;
  const districtChildren = useQuery({
    ...queryOptions,
    queryKey: ["address-divisions", mode, "district", districtCode],
    queryFn: ({ signal }) => fetchSubdivisions(mode, "district", districtCode!, signal),
    enabled: !manual && usesDistrict && districtCode !== undefined,
  });
  const activeQuery = level === "province" || provinceCode === undefined
    ? provinces
    : usesDistrict && districtCode !== undefined ? districtChildren : provinceChildren;
  const parentMissing = (level !== "province" && provinces.isSuccess && provinceCode === undefined)
    || (usesDistrict && provinceChildren.isSuccess && districtCode === undefined);
  const divisions = useMemo(() => {
    const searchTerm = normalizeDivision(deferredSearch);
    return parentMissing ? [] : (activeQuery.data ?? []).filter(({ name }) =>
      normalizeDivision(name).includes(searchTerm),
    );
  }, [activeQuery.data, deferredSearch, parentMissing]);

  const dismiss = useCallback(() => ref.current?.dismiss(), []);

  function select(name: string) {
    if (name.trim().length < 2) return;
    onSelect(name.trim(), mode);
    dismiss();
  }

  return (
    <AppSheet
      header={{
        title: divisionLabels[level],
        actionLabel: "Đóng bộ chọn địa chỉ",
        className: "border-b-0 pb-0",
      }}
      ref={ref}
      fullWindowOnIOS
      keyboardBehavior="fillParent"
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onDismiss={onClose}
    >
      <View className="gap-2 border-b border-border px-4 pb-3">
        {level === "province" ? (
          <View className="flex-row gap-2">
            {modes.map(({ id, title }) => (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ checked: mode === id }}
                className={cn("min-h-12 flex-1 items-center justify-center rounded px-2 py-2", mode === id ? "bg-primary/10" : "bg-surface-soft")}
                onPress={() => { setMode(id); setSearch(""); }}
              >
                <Text className="text-center font-vietnam text-label-sm text-ink">{title}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <SearchInput
          inputComponent={SheetTextInput}
          autoCorrect
          accessibilityLabel={manual ? "Nhập tên địa phương" : "Tìm địa phương"}
          placeholder={manual ? "Nhập tên địa phương" : "Tìm theo tên địa phương"}
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch("")}
          onSubmitEditing={manual ? () => select(search) : undefined}
        />
      </View>
      <View
        style={{ flex: 1, minHeight: 0 }}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
      >
        {!manual && viewportHeight > 0 ? (
          <FlashList
            style={{ flex: 0, height: viewportHeight }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            data={divisions}
            keyExtractor={(item) => String(item.code)}
            renderScrollComponent={renderScrollComponent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const checked = mode === initialMode && normalizeDivision(value) === normalizeDivision(item.name);
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked }}
                  className="min-h-12 flex-row items-center gap-2 border-b border-border py-2 active:bg-surface-soft"
                  onPress={() => select(item.name)}
                >
                  <Text className="flex-1 font-vietnam text-body-md text-ink">{item.name}</Text>
                  {checked ? <Check color={colors.primary} size={18} /> : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="items-center gap-2 py-5">
                <Text accessibilityLiveRegion="polite" className="text-center font-vietnam text-body-md text-muted">
                  {parentMissing ? "Không tìm thấy đơn vị cấp trên. Bạn có thể chọn lại hoặc nhập thủ công."
                    : activeQuery.isPaused ? "Đang ngoại tuyến. Bạn có thể nhập thủ công."
                      : activeQuery.isError ? "Chưa tải được danh sách địa phương."
                        : activeQuery.isPending ? "Đang tải địa phương…" : "Không tìm thấy địa phương."}
                </Text>
                {activeQuery.isError ? (
                  <PrimaryBtn title="Thử lại" variant="secondary" onPress={() => void activeQuery.refetch()} />
                ) : null}
              </View>
            }
          />
        ) : null}
      </View>
      <SheetFooter className="flex-row justify-end pt-2" bottomPadding={8}>
        <PrimaryBtn
          title={manual ? "Xem danh sách" : "Nhập thủ công"}
          variant="ghost"
          onPress={() => { setSearch(manual ? "" : value); setManual(!manual); }}
        />
        {manual ? <PrimaryBtn title="Chọn" disabled={search.trim().length < 2} onPress={() => select(search)} /> : null}
      </SheetFooter>
    </AppSheet>
  );
}
