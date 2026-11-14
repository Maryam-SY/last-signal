import { Fragment, useEffect, useState, type CSSProperties } from 'react'
import { ChevronsDown } from 'lucide-react'
import { WarpField } from '@/components/celestial/WarpField'
import { IntroVideo } from '@/components/home/IntroVideo'
import { shouldPlayIntro } from '@/components/home/introSession'
import { WorldChapter, WorldEcho } from '@/components/home/WorldChapter'
import { WorldPortal } from '@/components/home/WorldPortal'
import { DepthJourney, type DepthLayer, type DepthScene } from '@/components/motion/DepthJourney'
import { ScatterText } from '@/components/motion/ScatterText'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { DESTINATION_IDS } from '@/types/content'

/**
 * Home — "Choose your destination" (US-2.1). The Moon and Mars sit at the centre; scrolling
 * flies the camera toward each world, then to the project's motto.
 */
export function ExplorePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('explore.title'))
  const reduced = useReducedMotion()
  // US-2.4: the intro video plays first (once per visit); the home lights up as it fades out.
  const [intro, setIntro] = useState<'playing' | 'fading' | 'done'>(() => (shouldPlayIntro(reduced) ? 'playing' : 'done'))
  const revealed = intro !== 'playing'

  const scenes: DepthScene[] = [
    { id: 'departure', label: t('explore.sceneDeparture') },
    { id: 'moon', label: t('destinations.moon.name') },
    { id: 'mars', label: t('destinations.mars.name') },
    { id: 'motto', label: t('explore.sceneMotto') },
  ]

  const layers: DepthLayer[] = [
    { id: 'departure', scene: 0, children: <Departure revealed={revealed} /> },
    { id: 'moon-echo', scene: 1, offset: 0.5, children: <WorldEcho id="moon" /> },
    { id: 'moon', scene: 1, children: <WorldChapter id="moon" number={1} /> },
    { id: 'mars-echo', scene: 2, offset: 0.5, children: <WorldEcho id="mars" /> },
    { id: 'mars', scene: 2, children: <WorldChapter id="mars" number={2} reversed /> },
    { id: 'motto', scene: 3, children: <Motto /> },
  ]

  return (
    <div className="relative">
      <WarpField />
      <div className="relative z-10">
        <DepthJourney scenes={scenes} layers={layers} navLabel={t('explore.journeyLabel')} />
      </div>
      {intro !== 'done' && <IntroVideo onReveal={() => setIntro('fading')} onDone={() => setIntro('done')} />}
    </div>
  )
}

/** Delay between two typed letters of the title (ms). */
const TYPE_MS = 70

/**
 * The opening scene: once the intro is over, the two worlds light up on the video's sky and
 * the title types itself above them. Under reduced motion everything is shown at once.
 */
function Departure({ revealed }: { revealed: boolean }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const title = t('explore.title')
  const letters = Array.from(title.replace(/ /g, '')).length
  const [typed, setTyped] = useState(0)
  const shown = reduced ? letters : Math.min(typed, letters)

  useEffect(() => {
    if (!revealed || reduced) return
    // Let the planets light up first, then type the title.
    let count = 0
    let interval: number | undefined
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        count += 1
        setTyped(count)
        if (count >= letters) window.clearInterval(interval)
      }, TYPE_MS)
    }, 650)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [revealed, reduced, letters, title])

  const appear = (delay: number) => ({
    className: cn('transition-[opacity,transform] duration-1000 ease-out', revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'),
    style: { transitionDelay: `${delay}ms` },
  })

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center">
      <p
        className={cn('font-mono text-[0.6rem] tracking-[0.3em] text-stellar-cyan uppercase sm:text-[0.68rem] sm:tracking-[0.35em]', appear(300).className)}
        style={appear(300).style}
      >
        {t('explore.eyebrow')}
      </p>
      <h1 className="text-glow mt-3 font-heading text-[clamp(2rem,min(7vw,8.5vh),5.5rem)] leading-[0.95] font-bold sm:mt-4">
        <ScatterText text={title} typed={revealed ? shown : 0} />
      </h1>
      <p
        className={cn(
          'scatter-fade mt-3 hidden max-w-xl px-6 text-sm text-moon-dust sm:px-0 sm:mt-5 sm:text-base [@media(min-height:700px)]:block',
          appear(1400).className,
        )}
        style={appear(1400).style}
      >
        {t('explore.intro')}
      </p>

      <ul
        aria-label={t('explore.destinationsLabel')}
        className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-2 sm:mt-8 sm:gap-10"
      >
        {DESTINATION_IDS.map((id, index) => (
          <li key={id} className="portal-slot flex justify-center" data-side={id === 'moon' ? 'left' : 'right'}>
            <div
              className={cn(
                'planet-glow flex w-full max-w-[min(100%,20rem)] justify-center transition-[opacity,transform] duration-1000 ease-out',
                revealed ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
              )}
              style={{ '--glow': id === 'moon' ? '#e2e8f0' : '#d97757', transitionDelay: `${index * 150}ms` } as CSSProperties}
            >
              <WorldPortal id={id} label={t(`destinations.${id}.cta`)} className="w-full" />
            </div>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          'scatter-fade mt-3 hidden items-center [@media(min-height:640px)]:flex gap-2 font-mono text-[0.6rem] tracking-[0.25em] text-moon-dust/80 uppercase sm:mt-6 sm:text-[0.68rem]',
          appear(1800).className,
        )}
        style={appear(1800).style}
      >
        <ChevronsDown className="size-4 motion-safe:animate-bounce" />
        {t('explore.scrollHint')}
      </p>
    </div>
  )
}

function Motto() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const words = t('explore.motto').split(' ')

  return (
    <div className="mx-auto max-w-4xl px-12 text-center sm:px-16">
      <p className="font-mono text-[0.65rem] tracking-[0.35em] text-stellar-cyan uppercase">
        {t('explore.mottoEyebrow')}
      </p>
      <p className="velocity-skew mt-6 font-heading text-[clamp(1.9rem,5.5vw,4.5rem)] leading-tight font-bold">
        <span className="sr-only">{t('explore.motto')}</span>
        <span aria-hidden="true">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              {index > 0 && ' '}
              <span className="motto-word" style={{ '--i': index, '--n': words.length } as CSSProperties}>
                {word}
              </span>
            </Fragment>
          ))}
        </span>
      </p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
        className="mt-10 inline-flex min-h-11 items-center rounded-full border border-moon-dust/40 px-5 text-sm font-medium transition-colors hover:border-stellar-cyan hover:text-stellar-cyan"
      >
        {t('explore.backToStart')}
      </button>
    </div>
  )
}
