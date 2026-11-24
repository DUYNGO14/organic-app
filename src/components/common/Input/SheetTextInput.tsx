import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { useContext, useEffect, useId } from "react";
import type { TextInputProps } from "react-native";
import { SheetInputFocusContext } from "../BottomSheet/sheet-input-focus";

const StyledSheetTextInput = cssInterop(BottomSheetTextInput, { className: "style" });

export function SheetTextInput({ onFocus, onBlur, ...props }: TextInputProps) {
  const inputId = useId();
  const trackFocus = useContext(SheetInputFocusContext);
  useEffect(() => () => trackFocus?.(inputId, false), [inputId, trackFocus]);

  return (
    <StyledSheetTextInput
      {...props}
      onFocus={(event) => {
        trackFocus?.(inputId, true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        trackFocus?.(inputId, false);
        onBlur?.(event);
      }}
    />
  );
}
