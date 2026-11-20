import ProductsScreen from "@/features/products/ProductsScreen";
import { useLocalSearchParams } from "expo-router";

export default function CategoriesRoute() {
  const { query } = useLocalSearchParams<{ query?: string | string[] }>();
  const initialSearch = (Array.isArray(query) ? query[0] : query)?.trim() ?? "";

  return <ProductsScreen key={initialSearch} initialSearch={initialSearch} />;
}
