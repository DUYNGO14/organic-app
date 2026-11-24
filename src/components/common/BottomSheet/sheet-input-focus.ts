import { createContext } from "react";

export const SheetInputFocusContext = createContext<
  ((inputId: string, focused: boolean) => void) | null
>(null);
