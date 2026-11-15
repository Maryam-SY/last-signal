import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpenText, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { api } from '@/api/client'
import type { DestinationDetail, MachineDetail, Media, MissionDetail } from '@/api/types'
import { paths } from '@/app/paths'
import { NarrationButton } from '@/components/audio/NarrationButton'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { LoadState } from '@/components/common/LoadState'
import { MACHINE_TRANSITION_NAME } from '@/components/hangar/MachinePortal'
import { ModelViewer3D } from '@/components/journey/ModelViewer3D'
import { PhotoFlight } from '@/components/journey/PhotoFlight'
import { LifeLine } from '@/components/machine/LifeLine'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { VideoReel } from '@/components/media/VideoReel'
import { Reveal } from '@/components/motion/Reveal'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { JourneyRail } from '@/components/navigation/JourneyRail'
import { RelationEnds } from '@/components/relations/RelationEnds'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { record } from '@/lib/explorerLog'
import { formatPartialDate } from '@/lib/formatDate'
import { bestStill, machineChapters, machineCover, modelOf } from '@/lib/journey'
import { lastSignal } from '@/lib/lifespan'
import { ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { isDestinationId, type DestinationId } from '@/types/content'
import { NotFoundPage } from './NotFoundPage'

export function MachinePage() {
  const { destinationId, machineId = '' } = useParams()
  if (!isDestinationId(destinationId)) return <NotFoundPage />
  return <MachineView key={machineId} destinationId={destinationId} machineId={machineId} />
}

/** NASA video files the reel can play (YouTube pages are not embedded). */
const isPlayableVideo = (media: Media) => media.type === 'video' && /\.mp4($|\?)/i.test(media.url)

/**
 * One machine, its whole life (US-5.12): it arrives, works, falls silent, and leaves
 * something behind. Nothing of any other machine is told here — the page ends by handing over
 * to the next machine of the same world.
 */
function MachineView({ destinationId, machineId }: { destinationId: DestinationId; machineId: string }) {
  const { t } = useTranslation()
  const machine = useApi(`machine:${machineId}`, (lang, signal) => api.machine(machineId, lang, signal))
  const missionId = machine.status === 'success' ? machine.data.missionId : null
  const mission = useApi(`mission:${missionId}`, (lang, signal) => api.mission(missionId ?? '', lang, signal), {
    enabled: missionId !== null,
  })
  const destination = useApi(`destination:${destinationId}`, (lang, signal) => api.destination(destinationId, lang, signal))
  useDocumentTitle(machine.status === 'success' ? machine.data.name : t('machine.title'))
  useEffect(() => record('machines', machineId), [machineId])

  if (machine.status !== 'success') {
    return (
      <div className="relative mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center px-5 py-16">
        <LoadState status={machine.status} onRetry={machine.retry} />
      </div>
    )
  }
  if (machine.data.destinationId !== destinationId) return <NotFoundPage />

  return (
    <MachineLife
      machine={machine.data}
      mission={mission.status === 'success' ? mission.data : null}
      destination={destination.status === 'success' ? destination.data : null}
    />
  )
}

interface MachineLifeProps {
  machine: MachineDetail
  mission: MissionDetail | null
  destination: DestinationDetail | null
}

function MachineLife({ machine, mission, destination }: MachineLifeProps) {
  const { t, locale } = useTranslation()
  const destinationId = machine.destinationId as DestinationId
  const cover = (mission ? machineCover(mission, machine.id) : undefined) ?? bestStill(machine.media.filter((m) => m.depiction === 'photo')) ?? bestStill(machine.media)
  const chapters = mission ? machineChapters(machine, mission, cover, 10) : []
  const videos = machine.media.filter(isPlayableVideo)
  const model = mission ? modelOf(mission, machine.id) : undefined
  const signal = lastSignal(machine.lifespan)
  const epilogue = machine.status.note ?? null

  // Next machine of the same world, so the visitor goes on from one life to the next.
  const all = destination ? destination.missions.flatMap((m) => m.machines.map((x) => ({ machine: x, mission: m }))) : []
  const here = all.findIndex((entry) => entry.machine.id === machine.id)
  const next = all.length > 1 && here >= 0 ? all[(here + 1) % all.length] : undefined

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const goTo = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const rail = [
    { id: 'arrival', label: t('machine.arrival') },
    { id: 'life', label: t('machine.lifeEyebrow') },
    ...(chapters.length > 0 ? [{ id: 'did', label: t('machine.didEyebrow') }] : []),
    ...(videos.length > 0 ? [{ id: 'videos', label: t('machine.videosEyebrow') }] : []),
    ...(model ? [{ id: 'model', label: t('machine.modelEyebrow') }] : []),
    ...(machine.relations.length > 0 ? [{ id: 'legacy', label: t('machine.legacyEyebrow') }] : []),
    { id: 'end', label: t('machine.endEyebrow') },
    ...(next ? [{ id: 'next', label: t('machine.next') }] : []),
  ]

  const narration = [
    `${machine.name}.`,
    machine.scienceSummary?.value ?? '',
    ...chapters.flatMap((chapter) => [chapter.title ?? '', chapter.text]),
    signal ? `${t('machine.lastSignal')} : ${formatPartialDate(signal.value, locale)}.` : '',
    epilogue ?? '',
  ]

  const register = (id: string) => (element: HTMLElement | null) => {
    sectionRefs.current[id] = element
  }

  return (
    <div data-world={destinationId} className="relative overflow-x-clip">
      <SpaceBackdrop />
      <ScrollProgress />
      <JourneyRail items={rail} label={t('machine.journeyLabel', { name: machine.name })} />

      <div className="relative z-10 md:pr-16 lg:pr-20">
        {/* Arrival: the machine, full screen. */}
        <section
          id="arrival"
          ref={register('arrival')}
          aria-labelledby="machine-title"
          className="relative isolate flex min-h-[100dvh] flex-col justify-end overflow-hidden"
        >
          {cover && (
            <div className="absolute inset-0 -z-10" style={{ viewTransitionName: MACHINE_TRANSITION_NAME }}>
              <img src={cover.url} alt={cover.alt} decoding="async" className="machine-hero-photo size-full object-cover" />
              <span className="absolute top-20 left-5 sm:left-8">
                <DepictionBadge depiction={cover.depiction} />
              </span>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/70 to-void/10" />
          <div className="hero-rise mx-auto w-full max-w-6xl px-5 pt-32 pb-16 sm:pb-20">
            <Link
              to={paths.destination(destinationId)}
              viewTransition
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-moon-dust transition-colors hover:text-world"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t('machine.back', { destination: t(`destinations.${destinationId}.name`) })}
            </Link>
            <p className={cn(eyebrow, 'mt-4 text-world')}>
              {machine.mission?.name} · {t(`machineType.${machine.type}`)}
            </p>
            <h1 id="machine-title" className="text-glow mt-2 font-heading text-[clamp(2.8rem,9vw,7rem)] leading-[0.92] font-bold tracking-tight">
              {machine.name}
            </h1>
            {machine.scienceSummary && <p className="mt-5 max-w-2xl text-lg text-starlight/90 sm:text-2xl">{machine.scienceSummary.value}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-moon-dust">
              <StatusBadge status={machine.status.value} />
              {machine.locationName && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {machine.locationName.value}
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <NarrationButton paragraphs={narration} />
              {machine.storyTarget && (
                <Link to={`${paths.story(machine.storyTarget.id)}?from=${encodeURIComponent(machine.id)}`} className={ctaPrimary}>
                  <BookOpenText aria-hidden="true" className="size-4" />
                  {t('machine.readStory')}
                </Link>
              )}
            </div>
          </div>
        </section>

        <Chapter id="life" register={register} eyebrowText={t('machine.lifeEyebrow')} title={t(machine.lifespan?.stillWorking?.value ? 'machine.lifeTitleAlive' : 'machine.lifeTitle', { name: machine.name })}>
          <LifeLine born={machine.date} lifespan={machine.lifespan} />
        </Chapter>

        {chapters.length > 0 && (
          <section id="did" ref={register('did')} aria-labelledby="did-title" className="scroll-mt-16">
            <div className="mx-auto max-w-6xl px-5 pt-20">
              <p className={cn(eyebrow, 'text-world')}>{t('machine.didEyebrow')}</p>
              <h2 id="did-title" className="mt-2 font-heading text-4xl font-bold sm:text-5xl">
                {t('machine.didTitle')}
              </h2>
            </div>
            <PhotoFlight
              label={t('journey.flightLabel', { name: machine.name })}
              items={chapters.map((chapter) => ({
                id: chapter.id,
                media: chapter.media,
                withStory: chapter.text !== chapter.media.description,
                content: (
                  <>
                    <p className="font-mono text-xs tracking-widest text-world uppercase">
                      {chapter.date ? (
                        <time dateTime={chapter.date.value}>{formatPartialDate(chapter.date.value, locale)}</time>
                      ) : (
                        t('journey.anotherLook')
                      )}
                    </p>
                    {chapter.title && <h3 className="mt-1 font-heading text-2xl leading-tight font-bold sm:text-4xl">{chapter.title}</h3>}
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-starlight/90 sm:text-lg">{chapter.text}</p>
                  </>
                ),
              }))}
            />
          </section>
        )}

        {videos.length > 0 && (
          <Chapter id="videos" register={register} eyebrowText={t('machine.videosEyebrow')} title={t('machine.videosTitle')}>
            <VideoReel
              videos={videos}
              label={t('video.label', { name: machine.name })}
              onFinished={() => goTo(model ? 'model' : machine.relations.length > 0 ? 'legacy' : 'end')}
            />
          </Chapter>
        )}

        {model && (
          <Chapter id="model" register={register} eyebrowText={t('machine.modelEyebrow')} title={t('machine.modelTitle')}>
            <LazyModel model={model} />
          </Chapter>
        )}

        {machine.relations.length > 0 && (
          <Chapter id="legacy" register={register} eyebrowText={t('machine.legacyEyebrow')} title={t('machine.legacyTitle')}>
            <ul className="grid gap-4 md:grid-cols-2">
              {machine.relations.map((relation, index) => (
                <li key={relation.id}>
                  <Reveal delay={index * 90} className="glass h-full rounded-3xl p-6">
                    <RelationEnds relation={relation} />
                    <p className="mt-3 text-lg leading-relaxed text-starlight">{relation.transmitted}</p>
                    <p className="mt-3 text-sm text-moon-dust">
                      <span className="font-semibold text-world">{t('story.evidence')} </span>
                      {relation.evidence}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Chapter>
        )}

        {/* Its last signal: the heartbeat goes flat. */}
        <section
          id="end"
          ref={register('end')}
          aria-labelledby="end-title"
          className="mx-auto flex min-h-[80dvh] max-w-4xl scroll-mt-16 flex-col items-center justify-center px-5 py-24 text-center"
        >
          <p className={cn(eyebrow, 'text-world')}>{t('machine.endEyebrow')}</p>
          <h2 id="end-title" className="mt-3 font-heading text-4xl font-bold sm:text-6xl">
            {machine.lifespan?.stillWorking?.value ? t('machine.endAlive') : t('machine.endTitle')}
          </h2>
          <svg aria-hidden="true" viewBox="0 0 600 80" preserveAspectRatio="none" className={cn('flatline mt-8 h-20 w-full max-w-2xl', machine.lifespan?.stillWorking?.value && 'is-alive')}>
            <path d="M0 40 H150 L162 16 L174 64 L186 40 H260 L268 30 L276 50 L284 40 H600" pathLength={1} className="flatline-path" />
          </svg>
          {signal && !machine.lifespan?.stillWorking?.value && (
            <p className="mt-6 font-mono text-2xl text-starlight sm:text-3xl">
              <time dateTime={signal.value}>{formatPartialDate(signal.value, locale)}</time>
            </p>
          )}
          {epilogue && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-starlight/90">{epilogue}</p>}
          {machine.locationName && (
            <p className="mt-6 inline-flex items-center gap-2 text-moon-dust">
              <MapPin aria-hidden="true" className="size-4" />
              {t('machine.restsAt', { place: machine.locationName.value })}
            </p>
          )}
        </section>

        {next && (
          <section id="next" ref={register('next')} aria-labelledby="next-title" className="mx-auto max-w-4xl scroll-mt-16 px-5 pb-28">
            <p className={cn(eyebrow, 'text-center text-world')}>{t('machine.next')}</p>
            <Link
              to={paths.machine(destinationId, next.machine.id)}
              viewTransition
              className="group relative mt-6 block overflow-hidden rounded-3xl border border-white/10"
            >
              {next.machine.cover && (
                <img
                  src={next.machine.cover.thumbnailUrl ?? next.machine.cover.url}
                  alt=""
                  loading="lazy"
                  className="aspect-[21/9] w-full object-cover opacity-70 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-90"
                />
              )}
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-transparent" />
              <span className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 sm:p-10">
                <span className="font-mono text-xs tracking-[0.25em] text-world uppercase">{next.mission.name}</span>
                <span id="next-title" className="mt-2 font-heading text-3xl font-bold sm:text-5xl">
                  {next.machine.name}
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  {t('hangar.wake')}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
            <div className="mt-8 text-center">
              <Link to={paths.destination(destinationId)} viewTransition className="inline-flex min-h-11 items-center gap-2 text-sm text-moon-dust hover:text-world">
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t('machine.back', { destination: t(`destinations.${destinationId}.name`) })}
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

interface ChapterProps {
  id: string
  eyebrowText: string
  title: string
  register: (id: string) => (element: HTMLElement | null) => void
  children: ReactNode
}

/** One clearly separated part of the machine's life: eyebrow, title, content. */
function Chapter({ id, eyebrowText, title, register, children }: ChapterProps) {
  return (
    <section id={id} ref={register(id)} aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <Reveal>
        <p className={cn(eyebrow, 'text-world')}>{eyebrowText}</p>
        <h2 id={`${id}-title`} className="mt-2 font-heading text-4xl font-bold sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  )
}

/** The NASA 3D model, loaded only when its chapter comes near (the viewer weighs ~140 KB). */
function LazyModel({ model }: { model: Media }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const element = ref.current
    if (!element || near) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '60% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [near])
  return (
    <div ref={ref} className="h-[28rem] lg:h-[36rem]">
      {near && <ModelViewer3D model={model} />}
    </div>
  )
}
