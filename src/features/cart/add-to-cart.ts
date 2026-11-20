import { useCartStore } from "@/features/cart/cart.store";
import type { HomeProduct } from "@/features/home/home.data";
import type { PackageOption } from "@/features/products/product-detail.data";
import Toast from "react-native-toast-message";

export function addToCart(product: HomeProduct, pack?: PackageOption, quantity = 1) {
  if (!useCartStore.getState().addProduct(product, pack, quantity)) return;

  Toast.show({
    type: "success",
    text1: "Đã thêm vào giỏ",
    text2: `${quantity} × ${product.name}${pack ? ` · ${pack.label}` : ""}`,
  });
}
