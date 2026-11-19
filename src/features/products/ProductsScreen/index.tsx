import { IconButton, SearchInput } from "@/components/common";
import { QualityPromise } from "@/features/home/components/QualityPromise";
import {
  catalogProducts,
  productCategories,
  type CatalogProduct,
  type ProductCategoryId,
} from "@/features/products/catalog.data";
import { CatalogProductCard } from "@/features/products/ProductsScreen/components/CatalogProductCard";
import { ProductCategoryChips } from "@/features/products/ProductsScreen/components/ProductCategoryChips";
import {
  ProductFilterSheet,
  type ProductFilters,
} from "@/features/products/ProductsScreen/components/ProductFilterSheet";
import {
  ProductSortSheet,
  type ProductSortId,
} from "@/features/products/ProductsScreen/components/ProductSortSheet";
import {
  SeasonFilterChips,
  type SeasonFilterValue,
} from "@/features/products/ProductsScreen/components/SeasonFilterChips";
import { useAppColors } from "@/hooks/use-app-colors";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import {
  ArrowDownUp,
  ChevronDown,
  Mic,
  QrCode,
  Search,
  SlidersHorizontal,
  Sprout,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
  selectedIds: ReadonlySet<ProductCategoryId>;
}) {
  if (selectedIds.size === 0) return "Tất cả sản phẩm";
  const selected = productCategories.filter(({ id }) => selectedIds.has(id));
  if (selected.length === 1) return selected[0].label;
  if (selected.length === 2)
    return selected.map(({ label }) => label).join(" & ");
  return `${selected.length} danh mục đã chọn`;
}

export default function ProductsScreen() {
  const colors = useAppColors();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<
    Set<ProductCategoryId>
  >(() => new Set(["greens"]));
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilterValue>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSortId>("harvest");
  const [filters, setFilters] = useState<ProductFilters>({
    certifications: [],
    priceBand: null,
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
        selectedCategoryIds.size === 0 ||
        product.categoryIds.some((id) => selectedCategoryIds.has(id));
      const seasonMatches =
        seasonFilter === "all" || product.seasonTags.includes(seasonFilter);
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
  }, [filters, search, seasonFilter, selectedCategoryIds, sort]);

  const toggleCategory = useCallback((id: ProductCategoryId) => {
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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

  const activeProductCount =
    search.trim() ||
    seasonFilter !== "all" ||
    filters.certifications.length > 0 ||
    filters.priceBand !== null
      ? visibleProducts.length
      : selectedCategoryIds.size === 0
        ? productCategories.reduce(
            (total, category) => total + category.count,
            0,
          )
        : productCategories
            .filter(({ id }) => selectedCategoryIds.has(id))
            .reduce((total, category) => total + category.count, 0);

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
              <SelectedCategoryLabel selectedIds={selectedCategoryIds} />
            </Text>
            <Text className="mt-0.5 font-vietnam text-body-sm text-muted">
              {activeProductCount} sản phẩm
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-row items-center gap-1.5 rounded-xl border border-border bg-surface-container-lowest px-2.5"
              onPress={() => setSortSheetVisible(true)}
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
              onPress={() => setFilterSheetVisible(true)}
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
      selectedCategoryIds,
      sort,
    ],
  );

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-canvas px-4 pb-2 pt-3">
        <SearchInput
          accessibilityLabel="Tìm kiếm nông sản"
          autoCapitalize="none"
          autoCorrect={false}
          containerClassName="min-w-0"
          inputClassName="text-body-md"
          inputWrapperClassName="rounded-xl border-border bg-surface-container-lowest px-3"
          leadingIcon={<Search color={colors.primary} size={21} />}
          onChangeText={setSearch}
          onClear={() => setSearch("")}
          placeholder="Tìm kiếm rau củ, trái cây hữu cơ..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          trailingAccessory={
            <View className="flex-row items-center">
              <IconButton
                disabled
                label="Tìm bằng giọng nói"
                size="lg"
                icon={<Mic color={colors.muted} size={20} />}
              />
              <IconButton
                disabled
                label="Quét mã QR hoặc mã vạch"
                size="lg"
                icon={<QrCode color={colors.muted} size={20} />}
              />
            </View>
          }
          value={search}
        />
      </View>

      <ProductCategoryChips
        categories={productCategories}
        onToggle={toggleCategory}
        selectedIds={selectedCategoryIds}
      />
      <SeasonFilterChips onSelect={setSeasonFilter} selected={seasonFilter} />

      <FlashList
        className="flex-1 bg-canvas"
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 10 }}
        data={visibleProducts}
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
                setSelectedCategoryIds(new Set());
                setSeasonFilter("all");
                setFilters({ certifications: [], priceBand: null });
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
        onSelect={(nextSort) => {
          setSort(nextSort);
          setSortSheetVisible(false);
        }}
        selected={sort}
        visible={sortSheetVisible}
      />
      {filterSheetVisible ? (
        <ProductFilterSheet
          certifications={certifications}
          filters={filters}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setFilterSheetVisible(false);
          }}
          onClose={() => setFilterSheetVisible(false)}
        />
      ) : null}
    </View>
  );
}
