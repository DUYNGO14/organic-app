import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { Platform, type TextInputProps } from "react-native";

const StyledSheetTextInput = cssInterop(BottomSheetTextInput, { className: "style" });

export function SheetTextInput(props: TextInputProps) {
  // Keep the Android scroll gesture available when a drag starts on an input.
  const gestureProps = Platform.OS === "android" ? { enabled: false } : {};
  return <StyledSheetTextInput {...props} {...gestureProps} />;
}
