import { useCartStore } from "@/features/cart/cart.store";
import type { PackageOption, Product } from "@/types/product";
import Toast from "react-native-toast-message";

export function addToCart(product: Product, pack?: PackageOption, quantity = 1) {
  if (!useCartStore.getState().addProduct(product, pack, quantity)) return;

  Toast.show({
    type: "success",
    text1: "Đã thêm vào giỏ",
    text2: `${quantity} × ${product.name}${pack ? ` · ${pack.label}` : ""}`,
  });
}
