import { useEffect, useRef, useState } from 'react'
import { AudioLines, Square } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { duck } from '@/lib/ambientSound'
import { canNarrate, narrate } from '@/lib/narration'
import { cn } from '@/lib/utils'

interface NarrationButtonProps {
  /** The story to read, paragraph by paragraph (already in the page's language). */
  paragraphs: readonly string[]
  className?: string
}

/** Speech languages by interface locale; Wolof stories are read from their French text. */
const SPEECH_LANG = { en: 'en', fr: 'fr', wo: 'fr' } as const

/**
 * "Listen to its story" (US-5.12): the browser's voice reads the page's story aloud; the space
 * sound is lowered meanwhile. Stops on a second click, and when the visitor leaves the page.
 */
export function NarrationButton({ paragraphs, className }: NarrationButtonProps) {
  const { t, locale } = useTranslation()
  const [speaking, setSpeaking] = useState(false)
  const stopRef = useRef<() => void>(() => {})

  useEffect(
    () => () => {
      stopRef.current()
      duck(false)
    },
    [],
  )

  if (!canNarrate() || paragraphs.length === 0) return null

  const toggle = () => {
    if (speaking) {
      stopRef.current()
      setSpeaking(false)
      duck(false)
      return
    }
    setSpeaking(true)
    duck(true)
    stopRef.current = narrate(paragraphs, SPEECH_LANG[locale], {
      onEnd: () => {
        setSpeaking(false)
        duck(false)
      },
    })
  }

  const Icon = speaking ? Square : AudioLines
  return (
    <button
      type="button"
      aria-pressed={speaking}
      onClick={toggle}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-void/40 px-5 text-sm font-semibold transition-colors hover:border-world hover:text-world aria-pressed:border-world aria-pressed:text-world',
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn('size-4', speaking && 'animate-pulse')} />
      {speaking ? t('narration.stop') : t('narration.listen')}
    </button>
  )
}
