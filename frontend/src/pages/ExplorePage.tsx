import { Fragment, useEffect, useState, type CSSProperties } from 'react'
import { ArrowRight, ChevronsDown, Globe2, Radio, Rocket } from 'lucide-react'
import { Link } from 'react-router'
import { api } from '@/api/client'
import { paths } from '@/app/paths'
import { IntroVideo } from '@/components/home/IntroVideo'
import { setIntroPlaying, shouldPlayIntro } from '@/components/home/introSession'
import { WorldChapter, WorldEcho } from '@/components/home/WorldChapter'
import { WorldPortal } from '@/components/home/WorldPortal'
import { DepthJourney, type DepthLayer, type DepthScene } from '@/components/motion/DepthJourney'
import { CountUp } from '@/components/motion/CountUp'
import { ScatterText } from '@/components/motion/ScatterText'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { ctaPrimary, eyebrow } from '@/lib/styles'
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
  const [intro, setIntro] = useState<'playing' | 'fading' | 'done'>(() => {
    const play = shouldPlayIntro(reduced)
    setIntroPlaying(play)
    return play ? 'playing' : 'done'
  })
  // Leaving the home page during the intro must not keep the globes of other pages waiting.
  useEffect(() => () => setIntroPlaying(false), [])
  const revealed = intro !== 'playing'

  const scenes: DepthScene[] = [
    { id: 'departure', label: t('explore.sceneDeparture') },
    { id: 'moon', label: t('destinations.moon.name') },
    { id: 'mars', label: t('destinations.mars.name') },
    { id: 'expedition', label: t('explore.stepsEyebrow') },
    { id: 'motto', label: t('explore.sceneMotto') },
  ]

  const layers: DepthLayer[] = [
    { id: 'departure', scene: 0, children: <Departure revealed={revealed} /> },
    { id: 'moon-echo', scene: 1, offset: 0.5, children: <WorldEcho id="moon" /> },
    { id: 'moon', scene: 1, children: <WorldChapter id="moon" number={1} /> },
    { id: 'mars-echo', scene: 2, offset: 0.5, children: <WorldEcho id="mars" /> },
    { id: 'mars', scene: 2, children: <WorldChapter id="mars" number={2} reversed /> },
    { id: 'expedition', scene: 3, children: <Expedition /> },
    { id: 'motto', scene: 4, children: <Motto /> },
  ]

  return (
    <div className="relative">
      <div className="relative z-10">
        <DepthJourney scenes={scenes} layers={layers} navLabel={t('explore.journeyLabel')} />
      </div>
      {intro !== 'done' && (
        <IntroVideo
          onReveal={() => {
            setIntroPlaying(false)
            setIntro('fading')
          }}
          onDone={() => setIntro('done')}
        />
      )}
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
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center">
      <h1 className="text-glow font-heading text-[clamp(2rem,min(7vw,8.5vh),5.5rem)] leading-[0.95] font-bold sm:mt-4">
        <ScatterText text={title} typed={revealed ? shown : 0} />
      </h1>
      <p
        className={cn(
          'scatter-fade text-legible mt-3 hidden max-w-xl px-6 text-sm text-starlight/85 sm:px-0 sm:mt-5 sm:text-base [@media(min-height:1050px)]:block',
          appear(1400).className,
        )}
        style={appear(1400).style}
      >
        {t('explore.intro')}
      </p>

      <div className="relative mt-2 grid w-full grid-cols-2 items-center gap-2 sm:mt-6 sm:gap-8">
        <ul aria-label={t('explore.destinationsLabel')} className="contents">
          {DESTINATION_IDS.map((id, index) => (
            <li
              key={id}
              className="portal-slot flex justify-center"
              data-side={id === 'moon' ? 'left' : 'right'}
            >
              <div
                className={cn(
                  'planet-glow flex w-full max-w-[min(100%,32rem)] justify-center transition-[opacity,transform] duration-1000 ease-out',
                  revealed ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
                )}
                style={{ '--glow': id === 'moon' ? '#e2e8f0' : '#d97757', transitionDelay: `${index * 150}ms` } as CSSProperties}
              >
                <WorldPortal id={id} label={t(`destinations.${id}.cta`)} className="w-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <HomeStats revealed={revealed} className={cn('scatter-fade', appear(1600).className)} style={appear(1600).style} />

      {/* US-5.13: a clear invitation to scroll, bigger than a hint. */}
      <p
        className={cn('scroll-cue mt-3 flex flex-col items-center gap-2 sm:mt-6', appear(1800).className)}
        style={appear(1800).style}
      >
        <span className="font-heading text-base font-semibold tracking-wide text-starlight sm:text-lg">{t('explore.scrollHint')}</span>
        <ChevronsDown aria-hidden="true" className="size-6 text-stellar-cyan motion-safe:animate-bounce" />
      </p>
    </div>
  )
}

/** Live numbers from the API (sourced content): worlds, missions and machines on the site. */
function HomeStats({ revealed, className, style }: { revealed: boolean; className?: string; style?: CSSProperties }) {
  const { t } = useTranslation()
  const destinations = useApi('destinations', (lang, signal) => api.destinations(lang, signal))
  if (destinations.status !== 'success') return null
  const missions = destinations.data.reduce((sum, d) => sum + d.missionCount, 0)
  const machines = destinations.data.reduce((sum, d) => sum + d.machineCount, 0)
  const stats = [
    { value: destinations.data.length, label: t('explore.statWorlds') },
    { value: missions, label: t('explore.statMissions') },
    { value: machines, label: t('explore.statMachines') },
  ]
  return (
    <dl
      aria-label={t('explore.statsLabel')}
      className={cn('mt-4 hidden items-end justify-center gap-6 sm:gap-12 [@media(min-height:1120px)]:flex', className)}
      style={style}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse items-center">
          <dt className="mt-1 font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{stat.label}</dt>
          <dd className="stat-number font-heading text-3xl leading-none font-bold sm:text-4xl">
            <CountUp value={stat.value} run={revealed} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

const EXPEDITION_STEPS = [
  { n: 1, Icon: Globe2 },
  { n: 2, Icon: Rocket },
  { n: 3, Icon: Radio },
] as const

/** US-5.11 pedagogy: how the visit works, in three stages, before the motto. */
function Expedition() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="expedition-title" className="mx-auto w-full max-w-5xl pr-12 pl-4 sm:px-16">
      <p className={cn(eyebrow, 'text-center text-stellar-cyan')}>{t('explore.stepsEyebrow')}</p>
      <h2 id="expedition-title" className="title-sheen mt-2 text-center font-heading text-[clamp(1.35rem,4.2vw,3.2rem)] leading-tight font-bold">
        {t('explore.stepsTitle')}
      </h2>
      <ol className="mt-4 grid gap-2.5 md:mt-10 md:grid-cols-3 md:gap-5">
        {EXPEDITION_STEPS.map(({ n, Icon }) => (
          <li
            key={n}
            className="expedition-card glass group relative flex gap-3 overflow-hidden rounded-2xl p-3 md:block md:p-6"
            style={{ '--i': n } as CSSProperties}
          >
            <span aria-hidden="true" className="text-outline absolute -top-3 right-2 hidden font-heading text-8xl font-bold md:block">
              {n}
            </span>
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stellar-cyan/10 text-stellar-cyan ring-1 ring-stellar-cyan/30 md:size-12">
              <Icon className="size-5 md:size-6" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold md:mt-5 md:text-xl">{t(`explore.step${n}Title`)}</h3>
              <p className="mt-0.5 text-[0.8rem] leading-snug text-moon-dust md:mt-2 md:text-sm md:leading-relaxed">{t(`explore.step${n}Text`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex justify-center md:mt-10">
        <Link to={paths.destination('moon')} viewTransition className={cn(ctaPrimary, 'cta-pulse group px-6')}>
          {t('explore.startCta')}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

function Motto() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const words = t('explore.motto').split(' ')

  return (
    <div className="mx-auto max-w-4xl px-12 text-center sm:px-16">
      <p className="font-mono text-[0.72rem] tracking-[0.35em] text-stellar-cyan uppercase">
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
