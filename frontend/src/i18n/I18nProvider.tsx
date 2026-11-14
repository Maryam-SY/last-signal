import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext'
import { DEFAULT_LOCALE, translate } from './translate'
import type { Locale, MessageKey, TranslateVars } from './types'

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale = DEFAULT_LOCALE }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  // Keep <html lang> in sync for screen readers and hyphenation (NFR-A11Y-008).
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: TranslateVars) => translate(locale, key, vars),
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
