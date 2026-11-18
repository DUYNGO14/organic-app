import { RoutePlaceholder } from "@/components/route-placeholder";
import { StackHeader } from "@/components/layout";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthPlaceholderScreenProps = {
  title: string;
};

export default function AuthPlaceholderScreen({
  title,
}: AuthPlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <StackHeader title={title} />
      <RoutePlaceholder title={title} />
    </SafeAreaView>
  );
}
