import { LOCALES, useTranslation, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

const ORDER = Object.keys(LOCALES) as Locale[]

/**
 * EN / FR switch in the header. Each button names its language in that language
 * ("English", "Français") and carries a matching `lang`, so screen readers pronounce it
 * correctly. The pressed state is exposed with aria-pressed, not by colour alone.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation()

  return (
    <fieldset className="flex items-center rounded-md border border-moon-dust/40 p-0.5">
      <legend className="sr-only">{t('language.label')}</legend>
      {ORDER.map((code) => {
        const active = code === locale
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={`${t(`language.${code}`)} (${code.toUpperCase()})`}
            onClick={() => setLocale(code)}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors',
              active ? 'bg-primary text-primary-foreground underline decoration-2 underline-offset-4' : 'text-moon-dust hover:text-foreground',
            )}
          >
            {code}
          </button>
        )
      })}
    </fieldset>
  )
}
