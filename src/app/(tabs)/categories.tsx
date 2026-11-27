import { productCategories } from "@/features/products/catalog.data";
import ProductsScreen from "@/features/products/ProductsScreen";
import { useLocalSearchParams } from "expo-router";

export default function CategoriesRoute() {
  const { query, categoryId, resetId } = useLocalSearchParams<{
    query?: string | string[];
    categoryId?: string | string[];
    resetId?: string;
  }>();
  const initialSearch = (Array.isArray(query) ? query[0] : query)?.trim() ?? "";
  const requestedId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const initialCategoryId = productCategories.find(
    ({ id }) => id === requestedId,
  )?.id;

  return (
    <ProductsScreen
      key={JSON.stringify([initialSearch, initialCategoryId, resetId])}
      initialSearch={initialSearch}
      initialCategoryId={initialCategoryId}
    />
  );
}
