import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { IconButton } from "@/components/common";
import { QualityPromise } from "@/features/home/components/QualityPromise";
import {
  catalogProducts,
  productCategories,
  type CatalogProduct,
  type ProductCategoryId,
} from "@/features/products/catalog.data";
import { ProductSearchBar } from "@/features/products/components/ProductSearchBar";
import { CatalogProductCard } from "@/features/products/ProductsScreen/components/CatalogProductCard";
import {
  emptyProductFilters,
  ProductFilterSheet,
  type ProductFilters,
} from "@/features/products/ProductsScreen/components/ProductFilterSheet";
import {
  ProductSortSheet,
  type ProductSortId,
} from "@/features/products/ProductsScreen/components/ProductSortSheet";
import { useAppColors } from "@/hooks/use-app-colors";
import { FlashList, type FlashListRef, type ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import {
  ArrowDownUp,
  ChevronDown,
  SlidersHorizontal,
  Sprout,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

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
  const selected = productCategories.filter(({ id }) => selectedIds.includes(id));
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
  const listRef = useRef<FlashListRef<CatalogProduct>>(null);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<ProductSortId>("harvest");
  const [filters, setFilters] = useState<ProductFilters>({
    ...emptyProductFilters,
    categoryIds: initialCategoryId ? [initialCategoryId] : initialSearch ? [] : ["greens"],
  });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);

  const certifications = useMemo(
    () =>
      Array.from(
        new Set(
          catalogProducts
            .map((product) => product.certification)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [],
  );

  const visibleProducts = useMemo(() => {
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
  }, [filters, search, sort]);

  const openProduct = useCallback((product: CatalogProduct) => {
    router.push({
      pathname: "/(product)/product/[productId]",
      params: { productId: product.id },
    });
  }, []);

  const renderProduct = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item }) => <CatalogProductCard onPress={openProduct} product={item} />,
    [openProduct],
  );

  function applyFilters(nextFilters: ProductFilters) {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    setFilters(nextFilters);
  }

  const activeProductCount = visibleProducts.length;

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
        onChangeText={setSearch}
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
        keyExtractor={(product) => product.id}
        ListEmptyComponent={
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
        }
        ListFooterComponent={<QualityPromise />}
        ListHeaderComponent={header}
        numColumns={2}
        renderItem={renderProduct}
        ItemSeparatorComponent={ProductRowSeparator}
      />

      <ProductSortSheet
        onClose={() => setSortSheetVisible(false)}
        onSelect={setSort}
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
