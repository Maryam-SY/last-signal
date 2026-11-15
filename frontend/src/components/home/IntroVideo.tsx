import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SkipForward } from 'lucide-react'
import { useTranslation, type MessageKey } from '@/i18n'
import { createIntroScore, type IntroScore } from '@/lib/introSound'
import { canNarrate, narrate } from '@/lib/narration'
import { FADE_MS, markIntroSeen } from './introSession'

/**
 * US-2.4 / US-5.12: the intro, full screen, when the visitor arrives on the site — real NASA
 * footage (public domain): a Saturn V lifting off, the restored Apollo 11 moonwalk, then the
 * ground of Mars rushing up under Perseverance, filmed by its own camera. Short sentences appear
 * over the pictures (written, so they work without sound and are translated). US-5.13: it
 * ends on the title "The Next Frontier" in close-up, then fades into the home page; a
 * synthesised soundtrack follows the pictures (if the browser blocks sound, a button or any
 * key / tap turns it on). The video itself is muted (browsers only autoplay silent videos);
 * skippable at any time (button or Escape), skipped entirely if the browser refuses to play it.
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

/** How long the closing title stays in close-up before the site appears. */
const FINALE_MS = 3800

export function IntroVideo({ onReveal, onDone }: IntroVideoProps) {
  const { t, locale } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [leaving, setLeaving] = useState(false)
  const [cue, setCue] = useState(-1)
  const [finale, setFinale] = useState(false)
  const doneRef = useRef(false)
  const scoreRef = useRef<IntroScore | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const stopVoice = useRef<() => void>(() => {})
  const spokenCue = useRef(-1)
  const finaleTimer = useRef<number | undefined>(undefined)
  const doneTimer = useRef<number | undefined>(undefined)

  const finish = (fade: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    stopVoice.current()
    window.clearTimeout(finaleTimer.current)
    scoreRef.current?.stop(fade ? FADE_MS / 1000 + 0.4 : 0.2)
    markIntroSeen()
    onReveal()
    if (!fade) {
      onDone()
      return
    }
    setLeaving(true)
    doneTimer.current = window.setTimeout(onDone, FADE_MS)
  }
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  })

  /** The footage is over: the closing title in close-up, then the site. */
  const startFinale = () => {
    if (doneRef.current || finale) return
    setFinale(true)
    setCue(-1)
    scoreRef.current?.finale()
    finaleTimer.current = window.setTimeout(() => finishRef.current(true), FINALE_MS)
  }

  /**
   * Turns the soundtrack on. Tried at once; browsers that insist on a gesture first get it
   * at the visitor's first touch, click or key (no button to press: the intro keeps its flow).
   */
  const enableSound = () => {
    const score = scoreRef.current
    if (!score || doneRef.current) return
    void score.start(videoRef.current?.currentTime ?? 0).then((playing) => {
      setSoundOn(playing)
      if (playing && finale) score.finale()
    })
  }
  const enableSoundRef = useRef(enableSound)
  useEffect(() => {
    enableSoundRef.current = enableSound
  })

  useEffect(() => {
    // The soundtrack: tried at once; browsers that need a gesture first get a button.
    const score = createIntroScore()
    scoreRef.current = score
    if (score) void score.start(0).then((playing) => setSoundOn(playing && !doneRef.current))
    const onGesture = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') return
      if (scoreRef.current && !scoreRef.current.playing()) enableSoundRef.current()
    }
    for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) window.addEventListener(type, onGesture, { passive: true })
    return () => {
      for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) window.removeEventListener(type, onGesture)
      stopVoice.current()
      window.clearTimeout(finaleTimer.current)
      window.clearTimeout(doneTimer.current)
      scoreRef.current?.stop(0.3)
    }
  }, [])

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
    // The voice says the sentence on screen (synthesised: no recording of anyone's voice).
    if (soundOn && index >= 0 && index !== spokenCue.current && canNarrate()) {
      spokenCue.current = index
      stopVoice.current()
      stopVoice.current = narrate([t(CUES[index]!.key)], locale === 'en' ? 'en' : 'fr')
    }
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
        onEnded={startFinale}
        onError={() => finish(false)}
        aria-hidden="true"
        className={`size-full object-cover transition-opacity duration-700 ${finale ? 'opacity-0' : 'opacity-100'}`}
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
      {finale && (
        <div aria-hidden="true" className="intro-finale pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
          <div className="intro-finale-card" style={{ perspective: '800px' }}>
            <p className="intro-finale-eyebrow font-mono text-[0.72rem] tracking-[0.45em] text-stellar-cyan uppercase sm:text-sm">{t('intro.presents')}</p>
            <p className="mt-4 font-heading text-[clamp(2rem,7vw,6rem)] leading-none font-medium tracking-[0.12em] text-white">
              {Array.from(t('intro.finale')).map((letter, index) => (
                <span key={index} className={`intro-finale-letter${letter === ' ' ? ' is-space' : ''}`} style={{ '--i': index } as CSSProperties}>
                  {letter === ' ' ? '\u00a0' : letter}
                </span>
              ))}
            </p>
            <span className="intro-finale-line" />
          </div>
        </div>
      )}
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
