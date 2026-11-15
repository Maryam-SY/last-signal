import { useEffect } from 'react'
import { ArrowLeft, ChevronsDown } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ApiError, api } from '@/api/client'
import { paths } from '@/app/paths'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { LoadState } from '@/components/common/LoadState'
import { PinnedDestinationPlanet, StaticDestinationPlanet } from '@/components/destination/DestinationPlanet'
import { NextWorld } from '@/components/destination/NextWorld'
import { MachineHangar } from '@/components/hangar/MachineHangar'
import { Scene } from '@/components/destination/Scene'
import { CountUp } from '@/components/motion/CountUp'
import { JourneyRail } from '@/components/navigation/JourneyRail'
import { WorldTimeline } from '@/components/timeline/WorldTimeline'
import { getBodyByDestination } from '@/content/celestialBodies'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { contentLang } from '@/i18n/translate'
import { record } from '@/lib/explorerLog'
import { ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { DESTINATION_IDS, isDestinationId, type DestinationId } from '@/types/content'
import { NotFoundPage } from './NotFoundPage'

export function DestinationPage() {
  const { destinationId } = useParams()
  if (!isDestinationId(destinationId)) {
    return <NotFoundPage />
  }
  return <DestinationView destinationId={destinationId} />
}

/**
 * A destination (US-5.6, US-5.12): the planet stays pinned while the visitor descends from
 * orbit to the hangar, where they choose one machine — each machine then has its own page with
 * its whole life. The Moon + Mars timeline and the next world close the page.
 */
function DestinationView({ destinationId }: { destinationId: DestinationId }) {
  const { t, locale } = useTranslation()
  const reduced = useReducedMotion()
  const body = getBodyByDestination(destinationId)
  const name = t(`bodies.${destinationId}.name`)
  const destination = useApi(`destination:${destinationId}`, (lang, signal) => api.destination(destinationId, lang, signal))
  const other = DESTINATION_IDS.find((id) => id !== destinationId)
  useDocumentTitle(name, destination.status === 'success' ? destination.data.intro : null)
  useEffect(() => record('worlds', destinationId), [destinationId])

  const railItems = [
    { id: 'orbit', label: t('destination.orbit') },
    { id: 'hangar', label: t('hangar.rail') },
    { id: 'timeline', label: t('timeline.rail') },
    ...(other ? [{ id: 'next-world', label: t('destination.nextWorld') }] : []),
  ]

  if (destination.status === 'error' && destination.error instanceof ApiError && destination.error.status === 404) return <NotFoundPage />

  return (
    <div data-world={destinationId} lang={contentLang(locale)} className="relative overflow-x-clip">
      <SpaceBackdrop />
      {body && !reduced && <PinnedDestinationPlanet key={destinationId} body={body} />}
      <JourneyRail items={railItems} label={t('destination.journeyLabel')} />

      {/* Gutter for the fixed journey rail (md and up), so its dots never cover the content. */}
      <div className="relative z-10 md:pr-16 lg:pr-20">
        <section
          id="orbit"
          aria-labelledby="destination-title"
          className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl scroll-mt-16 flex-col px-5 pt-4 pb-10 lg:justify-center lg:py-16"
        >
          {body && (reduced ? <StaticDestinationPlanet body={body} className="lg:hidden" /> : <div aria-hidden="true" className="dest-planet-gap" />)}

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div className="hero-rise">
              <Link
                to={paths.home()}
                viewTransition
                className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-moon-dust transition-colors hover:text-world"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t('destination.backToDestinations')}
              </Link>
              <p className={cn(eyebrow, 'mt-4 text-world')}>{t(`bodies.${destinationId}.kind`)}</p>
              <h1
                id="destination-title"
                className="text-glow mt-2 font-heading text-[clamp(3.5rem,14vw,8.5rem)] leading-[0.9] font-bold tracking-tight"
              >
                {name}
              </h1>
              <p className="mt-5 max-w-xl text-moon-dust sm:text-lg">{t(`bodies.${destinationId}.description`)}</p>

              <dl className="mt-8 flex gap-10">
                <Stat value={destination.status === 'success' ? destination.data.missionCount : null} label={t('destination.statMissions')} />
                <Stat value={destination.status === 'success' ? destination.data.machineCount : null} label={t('destination.statMachines')} />
              </dl>

              <a href="#hangar" className={cn(ctaPrimary, 'mt-8')}>
                {t('hangar.title')}
                <ChevronsDown aria-hidden="true" className="size-4" />
              </a>
            </div>
            {body && reduced && <StaticDestinationPlanet body={body} className="hidden lg:block" />}
          </div>

          <p
            aria-hidden="true"
            className={cn(eyebrow, 'mt-auto hidden items-center gap-2 self-center pt-10 text-moon-dust/80 sm:flex lg:absolute lg:bottom-6')}
          >
            <ChevronsDown className="size-4 motion-safe:animate-bounce" />
            {t('destination.scrollHint')}
          </p>
        </section>

        {destination.status === 'success' ? (
          <MachineHangar destination={destination.data} />
        ) : (
          <div className="mx-auto max-w-6xl px-5 py-20">
            <LoadState status={destination.status} onRetry={destination.retry} variant="cards" />
          </div>
        )}

        {/* US-5.13: the timeline of this world only. */}
        {destination.status === 'success' && (
          <Scene
            id="timeline"
            eyebrow={t('timeline.eyebrow')}
            title={t('timeline.worldTitle', { destination: destination.data.name })}
            intro={t('timeline.worldIntro', { destination: destination.data.name })}
          >
            <WorldTimeline destination={destination.data} />
          </Scene>
        )}

        {other && <NextWorld id={other} />}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1 max-w-[9rem] text-xs leading-tight text-moon-dust">{label}</dt>
      <dd className="font-mono text-4xl font-medium text-world sm:text-5xl">
        {value === null ? <span aria-hidden="true" className="skeleton inline-block h-10 w-12 rounded-md align-middle" /> : <CountUp value={value} duration={1100} />}
      </dd>
    </div>
  )
}
