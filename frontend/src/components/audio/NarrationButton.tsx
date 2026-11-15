import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AudioLines, Square } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { duck } from '@/lib/ambientSound'
import { canNarrate, narrate } from '@/lib/narration'
import { bringIntoView, clearWordHighlight, highlightWord, readAlongParts, type ReadAlongPart } from '@/lib/readAlong'
import { cn } from '@/lib/utils'

interface NarrationButtonProps {
  className?: string
}

/** Speech languages by interface locale; Wolof stories are read from their French text. */
const SPEECH_LANG = { en: 'en', fr: 'fr', wo: 'fr' } as const
/** After the visitor scrolls by hand, the page stops following the voice for this long. */
const HANDS_OFF_MS = 5000

/**
 * "Listen to its story" (US-5.12): the browser's voice reads aloud the texts of the page marked
 * `data-narrate` (inside the closest `data-narration-root`), in page order. The page follows
 * the voice: the text being read is highlighted, the word being spoken too where the browser
 * allows it, and the page scrolls to it — unless the visitor scrolls by hand, then it lets them
 * be for a few seconds. A small bar stays on screen to stop it. The space sound is lowered
 * meanwhile. Stops on a second click, and when the visitor leaves the page.
 */
export function NarrationButton({ className }: NarrationButtonProps) {
  const { t, locale } = useTranslation()
  const reduced = useReducedMotion()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [speaking, setSpeaking] = useState(false)
  const stopRef = useRef<() => void>(() => {})
  const currentRef = useRef<HTMLElement | null>(null)
  const handsOffUntil = useRef(0)

  const unmark = () => {
    currentRef.current?.removeAttribute('data-narrating')
    currentRef.current = null
    clearWordHighlight()
  }

  const stop = () => {
    stopRef.current()
    stopRef.current = () => {}
    unmark()
    setSpeaking(false)
    duck(false)
  }
  const stopOnLeave = useRef(stop)
  useEffect(() => {
    stopOnLeave.current = stop
  })
  useEffect(() => () => stopOnLeave.current(), [])

  // Scrolling by hand (wheel, touch, keys) takes over from the voice for a moment.
  useEffect(() => {
    if (!speaking) return
    const handsOn = () => {
      handsOffUntil.current = Date.now() + HANDS_OFF_MS
    }
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) handsOn()
    }
    window.addEventListener('wheel', handsOn, { passive: true })
    window.addEventListener('touchmove', handsOn, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', handsOn)
      window.removeEventListener('touchmove', handsOn)
      window.removeEventListener('keydown', onKey)
    }
  }, [speaking])

  if (!canNarrate()) return null

  const start = () => {
    const root = buttonRef.current?.closest('[data-narration-root]') ?? document.body
    const parts: ReadAlongPart[] = readAlongParts(root)
    if (parts.length === 0) return
    handsOffUntil.current = 0
    setSpeaking(true)
    duck(true)
    stopRef.current = narrate(
      parts.map((part) => part.text),
      SPEECH_LANG[locale],
      {
        onParagraph: (index) => {
          const part = parts[index]
          if (!part) return
          unmark()
          currentRef.current = part.element
          part.element.setAttribute('data-narrating', '')
          if (Date.now() >= handsOffUntil.current) bringIntoView(part.element, reduced)
        },
        onWord: (index, charIndex, charLength) => {
          const part = parts[index]
          if (part?.inPlace) highlightWord(part.element, charIndex, charLength)
        },
        onEnd: stop,
      },
    )
  }

  const toggle = () => (speaking ? stop() : start())
  const Icon = speaking ? Square : AudioLines

  return (
    <>
      <button
        ref={buttonRef}
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
      {speaking &&
        createPortal(
          <div className="narration-bar glass-blur fixed top-20 left-1/2 z-[2400] flex -translate-x-1/2 items-center gap-3 rounded-full py-1.5 pr-1.5 pl-4 text-sm">
            <span aria-hidden="true" className="narration-eq text-world">
              <span />
              <span />
              <span />
            </span>
            <span className="font-medium">{t('narration.reading')}</span>
            <button
              type="button"
              onClick={stop}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 font-semibold transition-colors hover:border-world hover:text-world"
            >
              <Square aria-hidden="true" className="size-3.5" />
              {t('narration.stopShort')}
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
