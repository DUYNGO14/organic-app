import type { HomeProduct } from "@/features/home/home.data";
import type { DivisionMode } from "@/features/cart/address-divisions";
import {
  getProductDetailSpec,
  type PackageOption,
} from "@/features/products/product-detail.data";
import { create } from "zustand";

export type CartLine = {
  id: string;
  product: HomeProduct;
  pack: PackageOption;
  quantity: number;
  selected: boolean;
};

export type DeliveryAddress = {
  name: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  divisionMode?: DivisionMode;
  label?: "home" | "office";
  note?: string;
};

export type SavedDeliveryAddress = DeliveryAddress & { id: string };
export type PaymentMethod = "cash" | "bank-transfer";

export type VoucherType = "shipping" | "product";
export type AppliedVouchers = Record<VoucherType, string | null>;

export const WELCOME_VOUCHER = { code: "ORGANICVIET", percent: 25, maxDiscount: 100_000 };
export const CART_VOUCHERS = {
  shipping: [
    { code: "FREESHIP", maxDiscount: 25_000 },
    { code: "SHIP10K", maxDiscount: 10_000 },
  ],
  product: [
    WELCOME_VOUCHER,
    { code: "RAU10", percent: 10, maxDiscount: 30_000 },
  ],
};

const initialVouchers: AppliedVouchers = { product: WELCOME_VOUCHER.code, shipping: null };

type CartState = {
  lines: CartLine[];
  addresses: SavedDeliveryAddress[];
  selectedAddressId: string | null;
  defaultAddressId: string | null;
  paymentMethod: PaymentMethod;
  appliedVouchers: AppliedVouchers;
  addProduct: (product: HomeProduct, pack?: PackageOption, quantity?: number) => boolean;
  setQuantity: (id: string, quantity: number) => void;
  setSelected: (id: string, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
  remove: (id: string) => void;
  removeSelected: () => void;
  saveAddress: (address: DeliveryAddress, makeDefault: boolean, id?: string) => string;
  selectAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  removeAddress: (id: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAppliedVouchers: (vouchers: AppliedVouchers) => void;
  reset: () => void;
};

let nextAddressId = 1;

const initialDeliveryState = {
  addresses: [] as SavedDeliveryAddress[],
  selectedAddressId: null,
  defaultAddressId: null,
  paymentMethod: "cash",
} satisfies Pick<CartState, "addresses" | "selectedAddressId" | "defaultAddressId" | "paymentMethod">;

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  appliedVouchers: initialVouchers,
  ...initialDeliveryState,
  addProduct: (product, pack, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return false;

    const chosenPack = pack
      ?? getProductDetailSpec(product).packages.find((option) => option.price === product.price)
      ?? { label: product.subtitle, price: product.price, oldPrice: product.oldPrice, note: "" };
    const id = JSON.stringify([product.id, chosenPack.label]);

    set(({ lines }) => {
      const existing = lines.find((line) => line.id === id);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;

      return {
        lines: existing
          ? lines.map((line) => line.id === id ? { ...line, quantity: nextQuantity } : line)
          : [...lines, { id, product, pack: chosenPack, quantity: nextQuantity, selected: false }],
      };
    });
    return true;
  },
  setQuantity: (id, quantity) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    set(({ lines }) => ({
      lines: lines.map((line) => line.id === id ? { ...line, quantity } : line),
    }));
  },
  setSelected: (id, selected) => set(({ lines }) => ({
    lines: lines.map((line) => line.id === id ? { ...line, selected } : line),
  })),
  setAllSelected: (selected) => set(({ lines }) => ({
    lines: lines.map((line) => line.selected === selected ? line : { ...line, selected }),
  })),
  remove: (id) => set(({ lines }) => ({ lines: lines.filter((line) => line.id !== id) })),
  removeSelected: () => set(({ lines }) => ({ lines: lines.filter((line) => !line.selected) })),
  saveAddress: (address, makeDefault, id = String(nextAddressId++)) => {
    set((state) => {
      const nextAddress = { ...address, id };
      const exists = state.addresses.some((entry) => entry.id === id);
      const addresses = exists
        ? state.addresses.map((entry) => entry.id === id ? nextAddress : entry)
        : [...state.addresses, nextAddress];
      const defaultAddressId = makeDefault || !state.defaultAddressId
        ? id
        : state.defaultAddressId;

      return { addresses, defaultAddressId };
    });
    return id;
  },
  selectAddress: (id) => set((state) =>
    state.addresses.some((address) => address.id === id) ? { selectedAddressId: id } : state,
  ),
  setDefaultAddress: (id) => set((state) =>
    state.addresses.some((address) => address.id === id) ? { defaultAddressId: id } : state,
  ),
  removeAddress: (id) => set((state) => {
    const addresses = state.addresses.filter((address) => address.id !== id);
    return {
      addresses,
      selectedAddressId: state.selectedAddressId === id ? null : state.selectedAddressId,
      defaultAddressId: state.defaultAddressId === id ? addresses[0]?.id ?? null : state.defaultAddressId,
    };
  }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAppliedVouchers: (appliedVouchers) => set({ appliedVouchers }),
  reset: () => set({ lines: [], ...initialDeliveryState, appliedVouchers: initialVouchers }),
}));

export function selectDeliveryAddress(state: CartState) {
  const id = state.selectedAddressId ?? state.defaultAddressId;
  return state.addresses.find((address) => address.id === id) ?? null;
}

export function formatDeliveryAddress({ address, ward, district, province }: DeliveryAddress) {
  return [address, ward, district, province].filter(Boolean).join(", ");
}

export function selectCartQuantity({ lines }: CartState) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartTotals(selectedLines: readonly CartLine[], appliedVouchers: AppliedVouchers) {
  const subtotal = selectedLines.reduce(
    (sum, line) => sum + line.pack.price * line.quantity,
    0,
  );
  const productVoucher = CART_VOUCHERS.product.find(({ code }) => code === appliedVouchers.product);
  const shippingVoucher = CART_VOUCHERS.shipping.find(({ code }) => code === appliedVouchers.shipping);
  const productDiscount = productVoucher
    ? Math.min(Math.floor(subtotal * productVoucher.percent / 100), productVoucher.maxDiscount)
    : 0;
  const shipping = selectedLines.length ? 25_000 : 0;
  const shippingDiscount = shippingVoucher ? Math.min(shipping, shippingVoucher.maxDiscount) : 0;
  const discount = productDiscount + shippingDiscount;

  return {
    subtotal,
    productDiscount,
    productVoucherCode: productVoucher?.code,
    shippingDiscount,
    shippingVoucherCode: shippingVoucher?.code,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}
