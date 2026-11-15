import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { useTranslation, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

const LOCALES: readonly Locale[] = ['en', 'fr', 'wo']

/**
 * Language drop-down (ADR-015; Wolof US-5.12; drop-down US-5.13): one button showing the current
 * language, opening a short list of the three languages, each written in its own language.
 * Keyboard: Enter/Space opens, arrows move, Escape closes and gives focus back to the button.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listId = useId()

  useEffect(() => {
    if (!open) return
    itemRefs.current[LOCALES.indexOf(locale)]?.focus()
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointer)
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [open, locale])

  const choose = (code: Locale) => {
    setLocale(code)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onListKey = (event: KeyboardEvent) => {
    const index = itemRefs.current.findIndex((item) => item === document.activeElement)
    if (event.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      itemRefs.current[(index + step + LOCALES.length) % LOCALES.length]?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-moon-dust/30 px-2.5 text-xs font-medium text-starlight transition-colors hover:border-stellar-cyan aria-expanded:border-stellar-cyan"
      >
        <Languages aria-hidden="true" className="size-4" />
        <span className="font-mono uppercase">{locale}</span>
        <span className="sr-only">{` — ${t('lang.label')} : ${t(`lang.${locale}`)}`}</span>
        <ChevronDown aria-hidden="true" className={cn('hidden size-3.5 transition-transform min-[420px]:block', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          id={listId}
          aria-label={t('lang.label')}
          className="lang-menu glass-blur absolute right-0 z-[2600] mt-2 min-w-44 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
        >
          {LOCALES.map((code, index) => (
            <li key={code}>
              <button
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                type="button"
                lang={code}
                aria-current={locale === code ? 'true' : undefined}
                onClick={() => choose(code)}
                onKeyDown={onListKey}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-starlight transition-colors hover:bg-white/10 focus-visible:bg-white/10 aria-[current=true]:text-stellar-cyan"
              >
                <span className="w-6 font-mono text-xs uppercase text-moon-dust">{code}</span>
                <span className="flex-1">{t(`lang.${code}`)}</span>
                {locale === code && <Check aria-hidden="true" className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
