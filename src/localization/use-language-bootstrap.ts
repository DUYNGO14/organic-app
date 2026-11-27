import { useLocales } from "expo-localization";
import { useEffect, useState } from "react";

import { getDeviceLanguage, initializeLanguage, syncDeviceLanguage } from "./index";

export function useLanguageBootstrap() {
  const locales = useLocales();
  const deviceLanguage = getDeviceLanguage(locales);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void initializeLanguage().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) syncDeviceLanguage(deviceLanguage);
  }, [ready, deviceLanguage]);

  return ready;
}
