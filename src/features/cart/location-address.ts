import type { LocationGeocodedAddress } from "expo-location";
import {
  fetchProvinces,
  fetchSubdivisions,
  findDivision,
  normalizeDivision,
  type AddressDivision,
  type DivisionMode,
} from "./address-divisions";

const provinceAliases: Record<string, string> = {
  "hanoi": "Hà Nội",
  "ho chi minh city": "Hồ Chí Minh",
  "hcmc": "Hồ Chí Minh",
  "saigon": "Hồ Chí Minh",
};
const districtPrefix = /^(?:quan|huyen|thi xa|district)\s+/;
const wardPrefix = /^(?:phuong|xa|thi tran|dac khu|ward|commune)\s+/;
const provincePrefix = /^(?:tinh|thanh pho|tp|city|province)\s+/;

function matchDivision(items: AddressDivision[], candidates: readonly string[]) {
  for (const name of candidates) {
    const match = findDivision(items, name);
    if (match) return match;
  }
}

function addressParts(values: (string | null | undefined)[]) {
  return values.flatMap((value) => {
    const part = value?.trim();
    return part ? [part] : [];
  });
}

type LocatedAddress = {
  divisionMode: DivisionMode;
  province: string;
  district: string;
  ward: string;
  address: string;
};

export async function resolveLocationAddress(
  place: LocationGeocodedAddress,
  preferredMode: DivisionMode,
  signal: AbortSignal,
): Promise<LocatedAddress> {
  const result: LocatedAddress = {
    divisionMode: preferredMode,
    province: "",
    district: "",
    ward: "",
    address: "",
  };
  if (place.isoCountryCode && place.isoCountryCode.toUpperCase() !== "VN") return result;

  const [firstLine, ...formattedDivisions] = addressParts(place.formattedAddress?.split(",") ?? []);
  const street = place.street?.trim() ?? "";
  const streetNumber = place.streetNumber?.trim();
  const formattedStreet = firstLine && /^\d[\w/.-]*\s+\S/.test(firstLine) ? firstLine : "";
  result.address = street && streetNumber
    ? (street === streetNumber || street.startsWith(`${streetNumber} `) ? street : `${streetNumber} ${street}`)
    : formattedStreet || street;
  const administrativeParts = addressParts([place.district, place.subregion, place.city, ...formattedDivisions]);
  const provinceNames = addressParts([place.region, place.city, ...formattedDivisions]).map((name) =>
    provinceAliases[normalizeDivision(name)] ?? name,
  );
  const districtNames = administrativeParts
    .filter((name) => !wardPrefix.test(normalizeDivision(name)))
    .map((name) => name.replace(/^district\s+/i, "Quận "));
  const wardNames = administrativeParts
    .filter((name) => {
      const normalized = normalizeDivision(name);
      return !districtPrefix.test(normalized) && !provincePrefix.test(normalized);
    })
    .map((name) => name.replace(/^ward\s+/i, "Phường ").replace(/^commune\s+/i, "Xã "));
  const modes: DivisionMode[] = [preferredMode, preferredMode === "current" ? "legacy" : "current"];

  for (const mode of modes) {
    if (signal.aborted || provinceNames.length === 0) break;
    try {
      const provinces = await fetchProvinces(mode, signal);
      const province = matchDivision(provinces, provinceNames);
      if (!province) continue;
      if (!result.province) {
        result.province = province.name;
        result.divisionMode = mode;
      }

      const children = await fetchSubdivisions(mode, "province", province.code, signal);
      const district = mode === "legacy" ? matchDivision(children, districtNames) : undefined;
      if (mode === "legacy" && !district) continue;
      if (district && result.divisionMode === mode) result.district = district.name;

      const wards = district ? await fetchSubdivisions(mode, "district", district.code, signal) : children;
      const ward = matchDivision(wards, wardNames);
      if (ward) {
        return { ...result, divisionMode: mode, province: province.name, district: district?.name ?? "", ward: ward.name };
      }
    } catch {
      // The other address format can still resolve when this lookup fails.
    }
  }

  return result;
}
