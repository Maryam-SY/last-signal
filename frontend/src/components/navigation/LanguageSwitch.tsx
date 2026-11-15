import { Languages } from 'lucide-react'
import { useTranslation, type Locale } from '@/i18n'

const LOCALES: readonly Locale[] = ['en', 'fr', 'wo']

/**
 * EN / FR / WO switch (ADR-015, Wolof: US-5.12). From `sm` up: a two-button group, the pressed one is current.
 * On phones, where the header is narrow: one button that switches to the other language.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, locale, setLocale } = useTranslation()
  // Phones: one button that goes to the next language (EN → FR → WO → EN).
  const other: Locale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length] ?? 'en'

  return (
    <div className={className}>
      <fieldset className="hidden rounded-full border border-moon-dust/30 p-0.5 sm:flex">
        <legend className="sr-only">{t('lang.label')}</legend>
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            lang={code}
            title={t(`lang.${code}`)}
            aria-pressed={locale === code}
            onClick={() => setLocale(code)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full font-mono text-xs font-medium uppercase text-moon-dust transition-colors hover:text-starlight aria-pressed:bg-starlight aria-pressed:text-void"
          >
            {code}
          </button>
        ))}
      </fieldset>

      <button
        type="button"
        lang={other}
        onClick={() => setLocale(other)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-moon-dust/30 px-2 font-mono text-xs font-medium uppercase text-starlight sm:hidden"
      >
        <Languages aria-hidden="true" className="size-3.5" />
        {other}
        <span className="sr-only">{` — ${t(`lang.${other}`)}`}</span>
      </button>
    </div>
  )
}
