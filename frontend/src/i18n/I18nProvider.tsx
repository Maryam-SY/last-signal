import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext'
import { storeLocale } from './localeStorage'
import { DEFAULT_LOCALE, translate } from './translate'
import type { Locale, MessageKey, TranslateVars } from './types'

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
  /** Save the visitor's choice in the browser (the app does; tests usually don't). */
  persist?: boolean
}

export function I18nProvider({ children, initialLocale = DEFAULT_LOCALE, persist = false }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      if (persist) storeLocale(next)
    },
    [persist],
  )

  // Keep <html lang> in sync for screen readers and hyphenation (NFR-A11Y-008).
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: TranslateVars) => translate(locale, key, vars),
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
