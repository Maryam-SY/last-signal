import { Fragment, type CSSProperties } from 'react'
import { ChevronsDown } from 'lucide-react'
import { WarpField } from '@/components/celestial/WarpField'
import { WorldChapter, WorldEcho } from '@/components/home/WorldChapter'
import { WorldPortal } from '@/components/home/WorldPortal'
import { DepthJourney, type DepthLayer, type DepthScene } from '@/components/motion/DepthJourney'
import { ScatterText } from '@/components/motion/ScatterText'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { DESTINATION_IDS } from '@/types/content'

/**
 * Home — "Choose your destination" (US-2.1). The Moon and Mars sit at the centre; scrolling
 * flies the camera toward each world, then to the project's motto.
 */
export function ExplorePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('explore.title'))

  const scenes: DepthScene[] = [
    { id: 'departure', label: t('explore.sceneDeparture') },
    { id: 'moon', label: t('destinations.moon.name') },
    { id: 'mars', label: t('destinations.mars.name') },
    { id: 'motto', label: t('explore.sceneMotto') },
  ]

  const layers: DepthLayer[] = [
    { id: 'departure', scene: 0, children: <Departure /> },
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
    </div>
  )
}

function Departure() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center">
      <p className="font-mono text-[0.6rem] tracking-[0.3em] text-stellar-cyan uppercase sm:text-[0.68rem] sm:tracking-[0.35em]">
        {t('explore.eyebrow')}
      </p>
      <h1 className="mt-3 font-heading text-[clamp(2rem,min(7vw,8.5vh),5.5rem)] leading-[0.95] font-bold sm:mt-4">
        <ScatterText text={t('explore.title')} />
      </h1>
      <p className="scatter-fade mt-3 hidden max-w-xl px-6 text-sm text-moon-dust sm:px-0 sm:mt-5 sm:text-base [@media(min-height:700px)]:block">
        {t('explore.intro')}
      </p>

      <ul
        aria-label={t('explore.destinationsLabel')}
        className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-2 sm:mt-8 sm:gap-10"
      >
        {DESTINATION_IDS.map((id) => (
          <li key={id} className="portal-slot flex justify-center" data-side={id === 'moon' ? 'left' : 'right'}>
            <WorldPortal id={id} label={t(`destinations.${id}.cta`)} className="w-full max-w-[min(100%,20rem)]" />
          </li>
        ))}
      </ul>

      <p className="scatter-fade mt-3 hidden items-center [@media(min-height:640px)]:flex gap-2 font-mono text-[0.6rem] tracking-[0.25em] text-moon-dust/80 uppercase sm:mt-6 sm:text-[0.68rem]">
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
