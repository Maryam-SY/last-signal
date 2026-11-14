import { ArrowLeft, FlaskConical, Globe2, Rocket } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { paths } from '@/app/paths'
import { Starfield } from '@/components/celestial/Starfield'
import { LoadState } from '@/components/feedback/LoadState'
import { StoryExperience } from '@/components/story/StoryExperience'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { anchors } from '@/lib/anchors'
import { api } from '@/lib/api'
import { buildContentIndex } from '@/lib/contentIndex'
import { parseStep, STORY_STEP_COUNT } from '@/lib/story'
import { DESTINATION_IDS, type StoryDetail } from '@/types/content'

export function StoryPage() {
  const { storyId = '' } = useParams()
  const { t, locale } = useTranslation()
  const resource = useApiResource(`story:${storyId}:${locale}`, (signal) => api.story(storyId, locale, signal))
  useDocumentTitle(resource.status === 'success' ? resource.data.title : t('story.title'))

  if (resource.status === 'success') return <StoryView data={resource.data} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {resource.status === 'not-found' ? (
        <>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t('story.title')}</h1>
          <p className="mt-4 text-moon-dust">{t('story.notFound')}</p>
          <Link to={paths.home()} className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-cosmic-indigo hover:underline">
            {t('story.exit')}
          </Link>
        </>
      ) : (
        <>
          <h1 className="sr-only">{t('story.title')}</h1>
          <LoadState status={resource.status} onRetry={resource.retry} />
        </>
      )}
    </div>
  )
}

function StoryView({ data: story }: { data: StoryDetail }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const step = parseStep(searchParams.get('step'))
  const from = searchParams.get('from')
  const { missions, machines, relations } = story
  const index = buildContentIndex(story)
  // A story may span two missions (e.g. Surveyor 3 + Apollo 12): the last one is where it ends.
  const mission = missions.at(-1)
  const destinationId = mission?.destinationId ?? machines[0]?.destinationId ?? 'moon'

  const origin = machines.find((machine) => machine.id === from)
  const exitHref = origin?.destinationId
    ? paths.destination(origin.destinationId, { machine: origin.id })
    : paths.destination(destinationId)
  const otherDestination = DESTINATION_IDS.find((id) => id !== destinationId) ?? destinationId

  // Each step change pushes a history entry so the browser back button returns to the previous step.
  const goToStep = (next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', String(Math.min(Math.max(next, 1), STORY_STEP_COUNT)))
    setSearchParams(params)
  }

  const exit = (
    <Link to={exitHref} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-moon-dust hover:text-starlight">
      <ArrowLeft aria-hidden className="size-4" />
      {t('story.exit')}
    </Link>
  )

  const end = (
    <section aria-labelledby="story-end" className="rounded-2xl border border-stellar-cyan/40 bg-nebula-surface/50 p-5 sm:p-6">
      <h2 id="story-end" className="font-heading text-2xl font-bold">
        {t('story.endTitle')}
      </h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {missions.map((item) => (
          <Link
            key={item.id}
            to={`${paths.destination(item.destinationId ?? destinationId)}#${anchors.mission(item.id)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cosmic-indigo px-5 text-sm font-semibold text-void hover:bg-cosmic-indigo/85"
          >
            {t('story.endMission', { mission: item.name })}
          </Link>
        ))}
        <Link
          to={paths.destination(otherDestination)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-moon-dust/60 px-5 text-sm font-medium hover:border-starlight"
        >
          <Globe2 aria-hidden className="size-4" />
          {t('story.endOtherDestination', { destination: t(`destinations.${otherDestination}.name`) })}
        </Link>
      </div>
      {machines.length > 0 && (
        <>
          <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-moon-dust">{t('story.machinesTitle')}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {machines.map((machine) => (
              <li key={machine.id}>
                <Link
                  to={paths.destination(machine.destinationId ?? destinationId, { machine: machine.id })}
                  className="flex min-h-12 items-center gap-3 rounded-lg bg-deep-space/80 px-4 py-2 font-medium hover:bg-deep-space"
                >
                  <Rocket aria-hidden className="size-4 shrink-0 text-stellar-cyan" />
                  {machine.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )

  return (
    <div className="relative overflow-hidden">
      <Starfield />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stellar-cyan">
          {missions.map((item) => item.name).join(' + ')} · {t(`destinations.${destinationId}.name`)}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl">{story.title}</h1>
        {story.status === 'draft' && (
          <p className="mt-5 flex gap-2 rounded-lg border border-dashed border-stellar-gold/60 bg-stellar-gold/5 p-3 text-sm text-stellar-gold">
            <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
            {t('story.draftNotice')}
          </p>
        )}
        <div className="mt-8">
          <StoryExperience
            story={story}
            relations={relations}
            index={index}
            step={step}
            onStepChange={goToStep}
            exit={exit}
            end={end}
          />
        </div>
      </div>
    </div>
  )
}
