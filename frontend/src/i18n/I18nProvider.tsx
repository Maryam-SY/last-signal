import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext'
import { DEFAULT_LOCALE, isLocale, translate } from './translate'
import type { Locale, MessageKey, TranslateVars } from './types'

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

const STORAGE_KEY = 'orbemoria.locale'

/** The visitor's last choice (EN/FR switch), if the browser lets us read it. */
function storedLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return isLocale(value) ? value : null
  } catch {
    return null
  }
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale ?? storedLocale() ?? DEFAULT_LOCALE)

  // Keep <html lang> in sync for screen readers and hyphenation (NFR-A11Y-008).
  useEffect(() => {
    document.documentElement.lang = locale
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Storage blocked (private mode): the choice simply lasts for this visit.
    }
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: TranslateVars) => translate(locale, key, vars),
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
