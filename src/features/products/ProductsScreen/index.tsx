import { IconButton, PrimaryBtn } from "@/components/common";
import {
  ScreenSkeleton,
  type ScreenLoadingProps,
} from "@/components/common/Skeleton/ScreenSkeleton";
import { addToCart } from "@/features/cart/add-to-cart";
import { QualityPromise } from "@/features/home/components/QualityPromise";
import {
  catalogProducts,
  productCategories,
} from "@/features/products/catalog.data";
import { ProductSearchBar } from "@/features/products/components/ProductSearchBar";
import { CatalogProductCard } from "@/features/products/ProductsScreen/components/CatalogProductCard";
import {
  emptyProductFilters,
  ProductFilterSheet,
  type ProductFilters,
} from "@/features/products/ProductsScreen/components/ProductFilterSheet";
import { ProductSortSheet } from "@/features/products/ProductsScreen/components/ProductSortSheet";
import { isCatalogApiConfigured } from "@/features/products/products.api";
import { productKeys, useInfiniteProducts } from "@/features/products/products.queries";
import type { ProductSortId } from "@/features/products/products.types";
import { useAppColors } from "@/hooks/use-app-colors";
import type { CatalogProduct, ProductCategoryId } from "@/types/product";
import {
  FlashList,
  type FlashListRef,
  type ListRenderItem,
} from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowDownUp,
  ChevronDown,
  SlidersHorizontal,
  Sprout,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, Text, View } from "react-native";

function CatalogStatus({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  const { primary } = useAppColors();

  return (
    <View className="items-center gap-2 px-4 py-6" accessibilityLiveRegion="polite">
      {loading ? <ActivityIndicator color={primary} /> : null}
      <Text className="text-center font-vietnam text-body-sm text-muted">{message}</Text>
      {onRetry ? (
        <PrimaryBtn
          className="self-center"
          title="Thử lại"
          variant="secondary"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}

function ProductRowSeparator() {
  return <View className="h-3" />;
}

function priceMatches(price: number, band: ProductFilters["priceBand"]) {
  switch (band) {
    case "under-25":
      return price < 25_000;
    case "25-50":
      return price >= 25_000 && price <= 50_000;
    case "50-100":
      return price > 50_000 && price <= 100_000;
    case "over-100":
      return price > 100_000;
    default:
      return true;
  }
}

function SelectedCategoryLabel({
  selectedIds,
}: {
  selectedIds: readonly ProductCategoryId[];
}) {
  if (selectedIds.length === 0) return "Tất cả sản phẩm";
  const selected = productCategories.filter(({ id }) =>
    selectedIds.includes(id),
  );
  if (selected.length === 1) return selected[0].label;
  if (selected.length === 2)
    return selected.map(({ label }) => label).join(" & ");
  return `${selected.length} danh mục đã chọn`;
}

export default function ProductsScreen({
  initialSearch,
  initialCategoryId,
  isLoading = false,
}: ScreenLoadingProps & {
  initialSearch: string;
  initialCategoryId?: ProductCategoryId;
}) {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const listRef = useRef<FlashListRef<CatalogProduct>>(null);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim());
  const [sort, setSort] = useState<ProductSortId>("harvest");
  const [filters, setFilters] = useState<ProductFilters>(() =>
    initialCategoryId
      ? { ...emptyProductFilters, categoryIds: [initialCategoryId] }
      : emptyProductFilters,
  );
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);

  useEffect(() => {
    if (!isCatalogApiConfigured) return;
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const {
    data: catalogData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
    isPaused,
    isError,
    refetch,
  } = useInfiniteProducts({
    query: debouncedSearch || undefined,
    categoryIds: filters.categoryIds.length ? [...filters.categoryIds].sort() : undefined,
    season: filters.season === "all" ? undefined : filters.season,
    certifications: filters.certifications.length ? [...filters.certifications].sort() : undefined,
    priceBand: filters.priceBand ?? undefined,
    sort,
  });
  const isSearchPending = isCatalogApiConfigured && search.trim() !== debouncedSearch;

  const certifications = useMemo(
    () => {
      const available = isCatalogApiConfigured
        ? catalogData?.pages[0]?.certifications ??
          catalogData?.pages.flatMap((page) =>
            page.items.flatMap((product) =>
              product.certification ? [product.certification] : [],
            ),
          ) ??
          []
        : catalogProducts.flatMap((product) =>
            product.certification ? [product.certification] : [],
          );
      return Array.from(new Set([...available, ...filters.certifications]));
    },
    [catalogData, filters.certifications],
  );

  const visibleProducts = useMemo(() => {
    if (isCatalogApiConfigured) {
      const products = new Map<string, CatalogProduct>();
      for (const page of catalogData?.pages ?? []) {
        for (const product of page.items) {
          if (!products.has(product.id)) products.set(product.id, product);
        }
      }
      return Array.from(products.values());
    }

    const query = search.trim().toLocaleLowerCase("vi-VN");
    const selected = catalogProducts.filter((product) => {
      const categoryMatches =
        filters.categoryIds.length === 0 ||
        product.categoryIds.some((id) => filters.categoryIds.includes(id));
      const seasonMatches =
        filters.season === "all" || product.seasonTags.includes(filters.season);
      const queryMatches =
        !query ||
        `${product.name} ${product.subtitle} ${product.origin} ${product.certification ?? ""}`
          .toLocaleLowerCase("vi-VN")
          .includes(query);
      const certificationMatches =
        filters.certifications.length === 0 ||
        (product.certification !== undefined &&
          filters.certifications.includes(product.certification));

      return (
        categoryMatches &&
        seasonMatches &&
        queryMatches &&
        certificationMatches &&
        priceMatches(product.price, filters.priceBand)
      );
    });

    return selected.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.harvestOrder - a.harvestOrder;
    });
  }, [catalogData, filters, search, sort]);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }

  function loadNextPage() {
    if (!hasNextPage || isFetching || isPaused || isSearchPending) return;
    void fetchNextPage({ cancelRefetch: false });
  }

  const openProduct = useCallback((product: CatalogProduct) => {
    if (isCatalogApiConfigured) {
      queryClient.setQueryData(productKeys.detail(product.id), product);
    }
    router.push({
      pathname: "/(product)/product/[productId]",
      params: { productId: product.id },
    });
  }, [queryClient]);

  const renderProduct = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item }) => (
      <CatalogProductCard
        className="mx-1.5 flex-1"
        onAdd={addToCart}
        onPress={openProduct}
        product={item}
      />
    ),
    [openProduct],
  );

  function applyFilters(nextFilters: ProductFilters) {
    scrollToTop();
    setFilters(nextFilters);
  }

  const activeProductCount = catalogData?.pages[0]?.total ?? visibleProducts.length;

  const header = useMemo(
    () => (
      <View className="px-4 pb-4 pt-3">
        <View className="mb-4 overflow-hidden rounded-2xl bg-primary px-4 py-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="font-vietnam text-label-sm uppercase text-primary-fixed">
                ☼ Vụ đông xuân
              </Text>
              <Text className="mt-1 font-vietnam text-headline-sm text-on-primary">
                Rau giòn ngọt tự nhiên
              </Text>
              <Text className="mt-1 font-vietnam text-body-sm text-on-primary">
                Không hóa chất kích thích · Thu hoạch sáng sớm
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-on-primary/15">
              <Sprout color={colors.onPrimary} size={26} />
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text
              className="font-vietnam text-title-md text-ink"
              numberOfLines={1}
            >
              <SelectedCategoryLabel selectedIds={filters.categoryIds} />
            </Text>
            <Text className="mt-0.5 font-vietnam text-body-sm text-muted">
              {activeProductCount} sản phẩm
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-row items-center gap-1.5 rounded-xl border border-border bg-surface-container-lowest px-2.5"
              onPress={() => {
                Keyboard.dismiss();
                setSortSheetVisible(true);
              }}
            >
              <ArrowDownUp color={colors.muted} size={17} />
              <Text className="font-vietnam text-label-md text-ink">
                {sort === "harvest"
                  ? "Mới hái nhất"
                  : sort === "price-asc"
                    ? "Giá thấp"
                    : "Giá cao"}
              </Text>
              <ChevronDown color={colors.muted} size={16} />
            </Pressable>
            <IconButton
              label="Mở bộ lọc sản phẩm"
              size="lg"
              variant="outlined"
              className="rounded-xl border-border bg-surface-container-lowest"
              onPress={() => {
                Keyboard.dismiss();
                setFilterSheetVisible(true);
              }}
              icon={<SlidersHorizontal color={colors.primary} size={20} />}
            />
          </View>
        </View>
      </View>
    ),
    [
      activeProductCount,
      colors.muted,
      colors.onPrimary,
      colors.primary,
      filters.categoryIds,
      sort,
    ],
  );

  if (isLoading) return <ScreenSkeleton variant="catalog" />;

  return (
    <View className="flex-1 bg-canvas">
      <ProductSearchBar
        value={search}
        onChangeText={(value) => {
          scrollToTop();
          setSearch(value);
        }}
        onScanPress={() => {
          Keyboard.dismiss();
          router.push("/scan-qr");
        }}
      />

      <FlashList
        ref={listRef}
        className="flex-1 bg-canvas"
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 10 }}
        data={visibleProducts}
        maintainVisibleContentPosition={{ disabled: true }}
        onEndReached={isCatalogApiConfigured && !isFetchNextPageError ? loadNextPage : undefined}
        onEndReachedThreshold={0.5}
        keyExtractor={(product) => product.id}
        ListEmptyComponent={
          isCatalogApiConfigured && (isPending || isSearchPending) ? (
            <CatalogStatus
              loading={!isPaused}
              message={isPaused ? "Đang chờ kết nối mạng…" : "Đang tải sản phẩm…"}
            />
          ) : isCatalogApiConfigured && isError ? (
            <CatalogStatus
              message="Không thể tải sản phẩm."
              onRetry={() => void refetch({ cancelRefetch: false })}
            />
          ) : (
            <View className="items-center px-6 py-12">
              <Text className="font-vietnam text-title-md text-ink">
                Không tìm thấy sản phẩm
              </Text>
              <Text className="mt-1 text-center font-vietnam text-body-sm text-muted">
                Thử đổi danh mục hoặc xóa bớt bộ lọc đang chọn.
              </Text>
              <Pressable
                accessibilityRole="button"
                className="mt-3 min-h-11 justify-center px-3"
                onPress={() => {
                  setSearch("");
                  applyFilters(emptyProductFilters);
                }}
              >
                <Text className="font-vietnam text-label-md text-primary">
                  Xóa tìm kiếm và bộ lọc
                </Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          isCatalogApiConfigured && isFetchingNextPage ? (
            <CatalogStatus message="Đang tải thêm sản phẩm…" loading />
          ) : isCatalogApiConfigured && isPaused && hasNextPage ? (
            <CatalogStatus message="Đang chờ kết nối mạng…" />
          ) : isCatalogApiConfigured && isFetchNextPageError ? (
            <CatalogStatus message="Không thể tải thêm sản phẩm." onRetry={loadNextPage} />
          ) : !isCatalogApiConfigured || (catalogData && !hasNextPage) ? (
            <QualityPromise />
          ) : null
        }
        ListHeaderComponent={header}
        numColumns={2}
        renderItem={renderProduct}
        ItemSeparatorComponent={ProductRowSeparator}
      />

      <ProductSortSheet
        onClose={() => setSortSheetVisible(false)}
        onSelect={(value) => {
          scrollToTop();
          setSort(value);
        }}
        selected={sort}
        visible={sortSheetVisible}
      />
      {filterSheetVisible ? (
        <ProductFilterSheet
          certifications={certifications}
          filters={filters}
          onApply={applyFilters}
          onClose={() => setFilterSheetVisible(false)}
        />
      ) : null}
    </View>
  );
}
