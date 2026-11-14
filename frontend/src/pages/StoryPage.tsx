import { useEffect, useRef } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ApiError, api } from '@/api/client'
import type { Media, Relation, Source, StoryDetail } from '@/api/types'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/common/LoadState'
import { MediaFigure } from '@/components/media/MediaFigure'
import { RelationEnds } from '@/components/relations/RelationEnds'
import { SourceList } from '@/components/sources/SourceList'
import { VoiceTag } from '@/components/sources/VoiceTag'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { DESTINATION_IDS } from '@/types/content'

/** STORY-001 → 009: a six-step story driven by the URL (?step=1..6), never by scroll alone. */
export function StoryPage() {
  const { storyId = '' } = useParams()
  const { t } = useTranslation()
  const story = useApi(`story:${storyId}`, (lang, signal) => api.story(storyId, lang, signal))
  useDocumentTitle(story.status === 'success' ? story.data.title : t('story.title'))

  if (story.status === 'error' && story.error instanceof ApiError && story.error.status === 404) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('story.title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('story.unavailable', { storyId })}</p>
        <Link to={paths.home()} className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-cosmic-indigo hover:underline">
          {t('story.exit')}
        </Link>
      </div>
    )
  }

  if (story.status !== 'success') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('story.title')}</h1>
        <LoadState status={story.status} onRetry={story.retry} />
      </div>
    )
  }

  return <StoryExperience story={story.data} />
}

function StoryExperience({ story }: { story: StoryDetail }) {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const total = story.steps.length
  const requested = Number(params.get('step'))
  const current = Number.isInteger(requested) && requested >= 1 && requested <= total ? requested : 1
  const step = story.steps[current - 1]!
  const from = params.get('from')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  // Move focus to the new step title so keyboard and screen-reader users follow the change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [current])

  const goTo = (n: number) => {
    const next = new URLSearchParams(params)
    next.set('step', String(n))
    setParams(next) // push: the browser back button returns to the previous step
  }

  const destinationId = story.destinationId
  // Back to the machine the visitor came from, with its details open (US-4.2 criterion 3).
  const exitHref = destinationId
    ? from
      ? paths.machine(destinationId, from)
      : `${paths.destination(destinationId)}#missions-title`
    : paths.home()
  const mediaById = new Map(story.media.map((m) => [m.id, m]))
  const sourceById = new Map(story.sources.map((s) => [s.id, s]))

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-stellar-cyan">{story.missions.map((m) => m.name).join(' · ')}</p>
        <Link to={exitHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-cosmic-indigo hover:underline">
          <X aria-hidden="true" className="size-4" />
          {t('story.exit')}
        </Link>
      </div>
      <h1 className="mt-2 font-heading text-3xl font-bold sm:text-5xl">{story.title}</h1>

      {story.status === 'draft' && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-stellar-gold/50 bg-stellar-gold/10 p-3 text-sm">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-stellar-gold" />
          {t('story.draftNotice')}
        </p>
      )}

      <nav aria-label={t('story.progressLabel')} className="mt-6">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {story.steps.map((s, index) => {
            const n = index + 1
            const isCurrent = n === current
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => goTo(n)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={
                    isCurrent
                      ? 'flex min-h-11 w-full flex-col items-center justify-center rounded-md border-2 border-stellar-cyan bg-nebula-surface px-2 py-1 text-xs font-semibold'
                      : 'flex min-h-11 w-full flex-col items-center justify-center rounded-md border border-moon-dust/40 px-2 py-1 text-xs text-moon-dust hover:bg-nebula-surface'
                  }
                >
                  <span className="font-mono">{n}</span>
                  {s.title}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <section aria-labelledby="story-step-title" className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-moon-dust">{t('story.stepOf', { current, total })}</p>
        <h2 id="story-step-title" ref={headingRef} tabIndex={-1} className="mt-1 font-heading text-2xl font-bold outline-none sm:text-3xl">
          {step.title}
        </h2>

        <div className="mt-6 space-y-8">
          {step.blocks.map((block, index) => (
            <div key={index} className="space-y-3">
              <VoiceTag voice={block.voice} />
              <p className="text-lg leading-relaxed">{block.text}</p>
              <BlockMedia ids={block.mediaIds ?? []} mediaById={mediaById} />
              <BlockSources ids={block.sourceIds} sourceById={sourceById} />
            </div>
          ))}
        </div>

        {step.key === 'relay' && step.relationIds && (
          <Relations relations={story.relations.filter((r) => step.relationIds!.includes(r.id))} sourceById={sourceById} />
        )}
      </section>

      <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-stellar-border/50 pt-6">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface disabled:opacity-40"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('story.previous')}
        </button>
        {current < total && (
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
          >
            {t('story.next')}
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      {current === total && <StoryEnd story={story} exitHref={exitHref} />}
    </article>
  )
}

function BlockMedia({ ids, mediaById }: { ids: string[]; mediaById: Map<string, Media> }) {
  const items = ids.map((id) => mediaById.get(id)).filter((m): m is Media => m !== undefined)
  if (items.length === 0) return null
  return (
    <div className={items.length > 1 ? 'grid gap-3 sm:grid-cols-2' : ''}>
      {items.map((m) => (
        <MediaFigure key={m.id} media={m} />
      ))}
    </div>
  )
}

/** SOURCE-002: sources of a fact, one click away, without leaving the step. */
function BlockSources({ ids, sourceById }: { ids: string[]; sourceById: Map<string, Source> }) {
  const { t } = useTranslation()
  const sources = ids.map((id) => sourceById.get(id)).filter((s): s is Source => s !== undefined)
  if (sources.length === 0) return null
  return (
    <details className="rounded-md border border-stellar-border/50 bg-deep-space px-3 py-2">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-cosmic-indigo">
        {t('sources.count', { count: sources.length })}
      </summary>
      <div className="pt-2 pb-1">
        <SourceList sources={sources} />
      </div>
    </details>
  )
}

function Relations({ relations, sourceById }: { relations: Relation[]; sourceById: Map<string, Source> }) {
  const { t } = useTranslation()
  if (relations.length === 0) return null
  return (
    <section aria-labelledby="relations-title" className="mt-10 rounded-xl border border-stellar-cyan/40 bg-nebula-surface/50 p-5">
      <h3 id="relations-title" className="font-heading text-xl font-bold">
        {t('story.relationsTitle')}
      </h3>
      <ul className="mt-4 space-y-5">
        {relations.map((r) => (
          <li key={r.id}>
            <RelationEnds relation={r} />
            <p className="mt-1 font-medium">{r.transmitted}</p>
            <p className="mt-1 text-sm text-moon-dust">
              <span className="font-semibold">{t('story.evidence')} </span>
              {r.evidence}
            </p>
            <div className="mt-2">
              <BlockSources ids={r.sourceIds} sourceById={sourceById} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * STORY-008 / US-4.7: at the end, go back to the machines, to each mission of the story, to the
 * machines it cites, or explore the other destination.
 */
function StoryEnd({ story, exitHref }: { story: StoryDetail; exitHref: string }) {
  const { t } = useTranslation()
  const { destinationId } = story
  const other = DESTINATION_IDS.find((d) => d !== destinationId)
  return (
    <section aria-labelledby="story-end-title" className="mt-10">
      <h2 id="story-end-title" className="font-heading text-xl font-bold">
        {t('story.finishTitle')}
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {destinationId && (
          <Link to={exitHref} className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85">
            {t('story.backToDestination', { destination: t(`destinations.${destinationId}.name`) })}
          </Link>
        )}
        {other && (
          <Link
            to={paths.destination(other)}
            className="inline-flex min-h-11 items-center rounded-md border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface"
          >
            {t('story.exploreOther', { destination: t(`destinations.${other}.name`) })}
          </Link>
        )}
      </div>
      {story.missions.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold">{t('story.missionsTitle')}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {story.missions.map((mission) => (
              <li key={mission.id}>
                <Link
                  to={`${paths.destination(mission.destinationId)}#mission-${encodeURIComponent(mission.id)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-stellar-cyan/50 px-4 text-sm font-medium hover:bg-nebula-surface"
                >
                  {mission.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {story.machines.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold">{t('story.machinesTitle')}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {story.machines.map((machine) => (
              <li key={machine.id}>
                <Link
                  to={machine.destinationId ? paths.machine(machine.destinationId, machine.id) : paths.home()}
                  className="inline-flex min-h-11 items-center rounded-full border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface"
                >
                  {machine.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
