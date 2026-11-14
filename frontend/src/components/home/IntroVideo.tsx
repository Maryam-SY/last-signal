import { useEffect, useRef, useState } from 'react'
import { SkipForward } from 'lucide-react'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { useTranslation } from '@/i18n'
import { FADE_MS, markIntroSeen } from './introSession'

/**
 * US-2.4: the team's intro video, full screen, when the visitor arrives on the site. It ends
 * on the Moon and Mars over the Milky Way, then fades into the home page, which shows the same
 * two worlds on the same sky. Muted (browsers only autoplay silent videos), skippable at any
 * time (button or Escape), and skipped entirely if the browser refuses to play it.
 */
interface IntroVideoProps {
  /** The fade-out starts: the home page can light up underneath (true cross-fade). */
  onReveal: () => void
  /** The overlay is gone and can be removed. */
  onDone: () => void
}

export function IntroVideo({ onReveal, onDone }: IntroVideoProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(false)

  const finish = (fade: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    markIntroSeen()
    onReveal()
    if (!fade) {
      onDone()
      return
    }
    setLeaving(true)
    window.setTimeout(onDone, FADE_MS)
  }
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  })

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true })
    const video = videoRef.current
    try {
      const playing = video?.play()
      if (playing && typeof playing.catch === 'function') playing.catch(() => finishRef.current(false))
      else if (!playing) finishRef.current(false)
    } catch {
      finishRef.current(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finishRef.current(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section
      aria-label={t('intro.label')}
      className="fixed inset-0 z-[2600] bg-black transition-opacity ease-out"
      style={{ opacity: leaving ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: leaving ? 'none' : 'auto' }}
    >
      <video
        ref={videoRef}
        src="/media/intro.mp4"
        poster="/media/intro-poster.jpg"
        muted
        playsInline
        preload="auto"
        onEnded={() => finish(true)}
        onError={() => finish(false)}
        aria-hidden="true"
        className="size-full object-cover portrait:object-contain"
      />
      <p className="sr-only">{t('intro.description')}</p>
      <div className="pointer-events-none absolute top-20 left-4 sm:left-6">
        <DepictionBadge depiction="mixed" />
      </div>
      <button
        ref={skipRef}
        type="button"
        onClick={() => finish(true)}
        className="glass-blur absolute right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-starlight transition-colors hover:border-stellar-cyan hover:text-stellar-cyan sm:right-6"
      >
        {t('intro.skip')}
        <SkipForward aria-hidden="true" className="size-4" />
      </button>
    </section>
  )
}
