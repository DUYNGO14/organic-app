import { localizeContent } from "@/localization/content";
import { i18n } from "@/localization";
import { useCartStore } from "@/features/cart/cart.store";
import { requestSignIn } from "@/features/auth/member-access";
import type { PackageOption, Product } from "@/types/product";
import Toast from "react-native-toast-message";

export function addToCart(product: Product, pack?: PackageOption, quantity = 1) {
  requestSignIn(() => {
    if (!useCartStore.getState().addProduct(product, pack, quantity)) return;

    Toast.show({
      type: "success",
      text1: i18n.t("cart.addedToCart"),
      text2: `${quantity} × ${localizeContent(product.name)}${pack ? ` · ${localizeContent(pack.label)}` : ""}`,
    });
  });
}
