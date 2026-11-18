import { getApiErrorMessage } from "@/lib/axios";
import { useProducts } from "@/features/products/products.queries";
import type { Product } from "@/features/products/products.types";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

function ProductCard({ product }: { product: Product }) {
  return (
    <View className="mb-3 rounded-xl border border-border bg-surface p-4">
      <Text className="font-vietnam text-title-md text-ink" numberOfLines={1}>
        {product.title}
      </Text>
      <Text className="mt-1 font-vietnam text-body-sm capitalize text-muted">
        {product.category}
      </Text>
      <Text className="mt-3 font-vietnam text-label-lg text-primary">
        ${product.price.toFixed(2)}
      </Text>
    </View>
  );
}

export default function ProductsScreen() {
  const { data, error, isError, isPending, isRefetching, refetch } = useProducts();

  const renderProduct = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductCard product={item} />,
    [],
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator accessibilityLabel="Đang tải sản phẩm" />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="text-center font-vietnam text-body-md text-danger">
          {getApiErrorMessage(error, "Không thể tải danh sách sản phẩm.")}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-4 rounded-lg bg-primary px-5 py-3"
          onPress={() => void refetch()}
        >
          <Text className="font-vietnam text-label-md text-on-primary">
            Thử lại
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlashList
      className="flex-1 bg-canvas"
      contentContainerClassName="px-4 pb-6 pt-4"
      data={data?.products ?? []}
      keyExtractor={(product) => String(product.id)}
      ListEmptyComponent={
        <Text className="py-8 text-center font-vietnam text-body-md text-muted">
          Chưa có sản phẩm.
        </Text>
      }
      ListHeaderComponent={
        <View className="mb-4">
          <Text className="font-vietnam text-headline-md text-ink">
            Sản phẩm
          </Text>
          {isError ? (
            <Text className="mt-2 font-vietnam text-body-sm text-danger">
              {getApiErrorMessage(error)}
            </Text>
          ) : null}
        </View>
      }
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
      renderItem={renderProduct}
    />
  );
}
