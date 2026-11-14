import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { paths } from '@/app/paths'
import { LivePlanet } from '@/components/celestial/LivePlanet'
import { Starfield } from '@/components/celestial/Starfield'
import { LoadState } from '@/components/feedback/LoadState'
import { MissionGallery } from '@/components/gallery/MissionGallery'
import { WORLD_TRANSITION_NAME } from '@/components/home/worldTransition'
import { MachineDetail } from '@/components/machine/MachineDetail'
import { getBodyByDestination } from '@/content/celestialBodies'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { api } from '@/lib/api'
import { pickCover } from '@/lib/contentIndex'
import { isDestinationId, type DestinationId, type Media, type Source } from '@/types/content'
import { NotFoundPage } from './NotFoundPage'

function indexSources(sources: readonly Source[]): ReadonlyMap<string, Source> {
  return new Map(sources.map((source) => [source.id, source]))
}

/** machineId → best image among the media linked to that machine. */
function indexCovers(media: readonly Media[]): ReadonlyMap<string, Media> {
  const byMachine = new Map<string, Media[]>()
  for (const item of media) {
    for (const machineId of item.machineIds) byMachine.set(machineId, [...(byMachine.get(machineId) ?? []), item])
  }
  const covers = new Map<string, Media>()
  for (const [machineId, items] of byMachine) {
    const cover = pickCover(items)
    if (cover) covers.set(machineId, cover)
  }
  return covers
}

export function DestinationPage() {
  const { destinationId } = useParams()
  if (!isDestinationId(destinationId)) {
    return <NotFoundPage />
  }
  return <DestinationView key={destinationId} destinationId={destinationId} />
}

function DestinationView({ destinationId }: { destinationId: DestinationId }) {
  const { t, locale } = useTranslation()
  const { hash } = useLocation()
  const reducedMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const body = getBodyByDestination(destinationId)
  const name = t(`bodies.${destinationId}.name`)
  useDocumentTitle(name)

  // One resource for the page: missions and machines, every source (badges), and the images of
  // each mission so that every machine card can show its best photo.
  const resource = useApiResource(`destination:${destinationId}:${locale}`, async (signal) => {
    const destination = await api.destination(destinationId, locale, signal)
    const [sources, ...missionMedia] = await Promise.all([
      api.sources(locale, signal),
      ...destination.missions.map((mission) => api.media({ missionId: mission.id }, locale, signal)),
    ])
    return { destination, sources: indexSources(sources), covers: indexCovers(missionMedia.flat()) }
  })
  const data = resource.status === 'success' ? resource.data : undefined

  // ?machine=<id> selects a machine and opens its details; unknown ids are ignored (ARCHITECTURE §4).
  const requested = searchParams.get('machine')
  const selectedId =
    requested && data?.destination.missions.some(({ machines }) => machines.some((machine) => machine.id === requested))
      ? requested
      : null

  const setSelected = (machineId: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (machineId) params.set('machine', machineId)
    else params.delete('machine')
    setSearchParams(params, { replace: true, preventScrollReset: true })
  }

  // Deep link to a mission (#mission-<id>, end of a story): scroll to it and focus its title.
  useEffect(() => {
    if (!data || !hash) return
    const section = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!section) return
    section.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    section.querySelector<HTMLElement>('h3[tabindex="-1"]')?.focus({ preventScroll: true })
  }, [data, hash, reducedMotion])

  return (
    <div className="relative overflow-hidden">
      <Starfield />
      <div className="relative z-10">
        <section className="mx-auto flex min-h-[60vh] max-w-5xl flex-col justify-center px-5 py-12">
          <Link
            to={paths.home()}
            viewTransition
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-cosmic-indigo hover:underline"
          >
            <ArrowLeft className="size-4" />
            {t('destination.backToDestinations')}
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-stellar-cyan">
                {t(`bodies.${destinationId}.kind`)}
              </p>
              <h1 className="mt-4 font-heading text-5xl font-bold sm:text-6xl">{name}</h1>
              <p className="mt-5 max-w-xl text-moon-dust">{data?.destination.intro ?? t(`bodies.${destinationId}.description`)}</p>
            </div>

            {body && (
              <div
                className="order-first mx-auto w-[min(72vw,40vh,28rem)] lg:order-none lg:w-full"
                style={{ viewTransitionName: WORLD_TRANSITION_NAME }}
              >
                <LivePlanet body={body} arrivalRipple />
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="gallery-title" className="mx-auto max-w-6xl px-5 pb-20">
          <h2 id="gallery-title" className="font-heading text-3xl font-bold sm:text-4xl">
            {t('destination.galleryTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-moon-dust">{t(`destination.galleryIntro.${destinationId}`)}</p>
          <div className="mt-10">
            {data ? (
              <MissionGallery
                missions={data.destination.missions}
                covers={data.covers}
                sources={data.sources}
                selectedId={selectedId}
                onSelect={setSelected}
              />
            ) : (
              <LoadState status={resource.status === 'loading' ? 'loading' : 'error'} onRetry={resource.retry} />
            )}
          </div>
        </section>
      </div>

      <MachineDetail machineId={selectedId} onClose={() => setSelected(null)} />
    </div>
  )
}
