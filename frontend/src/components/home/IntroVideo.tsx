import { useEffect, useRef, useState } from 'react'
import { SkipForward } from 'lucide-react'
import { useTranslation, type MessageKey } from '@/i18n'
import { FADE_MS, markIntroSeen } from './introSession'

/**
 * US-2.4 / US-5.12: the intro, full screen, when the visitor arrives on the site — real NASA
 * footage (public domain): a Saturn V lifting off, the restored Apollo 11 moonwalk, then the
 * ground of Mars rushing up under Perseverance, filmed by its own camera. Short sentences appear
 * over the pictures (written, so they work without sound and are translated). It then fades
 * into the home page. Muted (browsers only autoplay silent videos), skippable at any time
 * (button or Escape), skipped entirely if the browser refuses to play it.
 */
interface IntroVideoProps {
  /** The fade-out starts: the home page can light up underneath (true cross-fade). */
  onReveal: () => void
  /** The overlay is gone and can be removed. */
  onDone: () => void
}

/** Sentences shown over the footage, in seconds of the edited video (public/media/intro-nasa.mp4). */
const CUES: ReadonlyArray<{ from: number; to: number; key: MessageKey }> = [
  { from: 0.4, to: 4.6, key: 'intro.cue1' },
  { from: 5.4, to: 8.2, key: 'intro.cue2' },
  { from: 8.8, to: 11.9, key: 'intro.cue3' },
  { from: 12.3, to: 99, key: 'intro.cue4' },
]

export function IntroVideo({ onReveal, onDone }: IntroVideoProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [leaving, setLeaving] = useState(false)
  const [cue, setCue] = useState(-1)
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

  const onTimeUpdate = () => {
    const time = videoRef.current?.currentTime ?? 0
    const index = CUES.findIndex((entry) => time >= entry.from && time < entry.to)
    if (index !== cue) setCue(index)
  }

  return (
    <section
      aria-label={t('intro.label')}
      className="fixed inset-0 z-[2600] bg-black transition-opacity ease-out"
      style={{ opacity: leaving ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: leaving ? 'none' : 'auto' }}
    >
      <video
        ref={videoRef}
        src="/media/intro-nasa.mp4"
        poster="/media/intro-nasa-poster.jpg"
        muted
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onEnded={() => finish(true)}
        onError={() => finish(false)}
        aria-hidden="true"
        className="size-full object-cover"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)]" />
      <p className="sr-only">{t('intro.description')}</p>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center px-6 text-center">
        {CUES.map((entry, index) => (
          <p
            key={entry.key}
            className={`intro-cue absolute max-w-3xl font-heading text-[clamp(1.6rem,4.5vw,3.6rem)] leading-tight font-bold text-white ${index === cue ? 'is-on' : ''}`}
          >
            {t(entry.key)}
          </p>
        ))}
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
