import { create } from "axios";

export type DivisionMode = "current" | "legacy";
export type DivisionLevel = "province" | "district" | "ward";
export type AddressDivision = { code: number; name: string };

type DivisionResponse = AddressDivision & {
  districts?: AddressDivision[] | null;
  wards?: AddressDivision[] | null;
};

const divisionApi = create({
  baseURL: "https://provinces.open-api.vn/api/",
  timeout: 8_000,
});

export function normalizeDivision(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function divisionName(value: string) {
  return normalizeDivision(value).replace(
    /^(?:tinh|thanh pho|tp|quan|huyen|thi xa|thi tran|phuong|xa|dac khu)\s+/,
    "",
  );
}

export function findDivision(items: AddressDivision[], name: string) {
  const exactName = normalizeDivision(name);
  return items.find((item) => normalizeDivision(item.name) === exactName)
    ?? items.find((item) => divisionName(item.name) === divisionName(name));
}

export async function fetchProvinces(mode: DivisionMode, signal: AbortSignal) {
  const version = mode === "legacy" ? "v1" : "v2";
  const { data } = await divisionApi.get<AddressDivision[]>(`${version}/p/`, { signal });
  return data;
}

export async function fetchSubdivisions(mode: DivisionMode, parent: "province" | "district", code: number, signal: AbortSignal) {
  const version = mode === "legacy" ? "v1" : "v2";
  const segment = parent === "province" ? "p" : "d";
  const { data } = await divisionApi.get<DivisionResponse>(`${version}/${segment}/${code}`, {
    signal,
    params: { depth: 2 },
  });
  return (mode === "legacy" && parent === "province" ? data.districts : data.wards) ?? [];
}
