import { useEffect, useState } from "react";
import { translations } from "./index";

type SupportedLocales = keyof typeof translations;
const DEFAULT_LOCALE: SupportedLocales = "en";

export const useTranslation = () => {
  let initialLocale: SupportedLocales = DEFAULT_LOCALE;
  if (isSupportedLocale(navigator.language)) {
    initialLocale = navigator.language
  }

  const [locale, setLocale] = useState<SupportedLocales>(initialLocale);
  const [dictionary, setDictionary] = useState(translations[DEFAULT_LOCALE]);

  useEffect(() => {
    setDictionary(translations[locale]);
  }, [locale]);

  return [dictionary, setLocale];
};

function isSupportedLocale(locale: string): locale is SupportedLocales {
  return (Object.keys(translations).includes(locale.toLocaleLowerCase()))
}
