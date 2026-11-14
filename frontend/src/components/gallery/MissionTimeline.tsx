import { LoadState } from '@/components/feedback/LoadState'
import { MediaFigure } from '@/components/media/MediaFigure'
import { SourceBadge } from '@/components/sources/SourceBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useTranslation } from '@/i18n'
import { api } from '@/lib/api'
import { formatPartialDate } from '@/lib/format'
import type { Source } from '@/types/content'

interface MissionTimelineProps {
  missionId: string
  sources: ReadonlyMap<string, Source>
}

/** The dated key moments of a mission, each with its source and illustrations (GET /api/missions/:id). */
export function MissionTimeline({ missionId, sources }: MissionTimelineProps) {
  const { t, locale } = useTranslation()
  const resource = useApiResource(`mission:${missionId}:${locale}`, (signal) => api.mission(missionId, locale, signal))
  if (resource.status !== 'success') {
    return <LoadState status={resource.status === 'loading' ? 'loading' : 'error'} onRetry={resource.retry} className="mt-4" />
  }

  return (
    <ol className="relative mt-5 space-y-8 border-l border-stellar-cyan/40 pl-6">
      {resource.data.timeline.map((event) => (
        <li key={event.id} className="relative">
          <span aria-hidden className="absolute -left-[1.85rem] top-1.5 size-3 rounded-full border-2 border-stellar-cyan bg-void" />
          <p className="font-mono text-xs text-stellar-gold">{formatPartialDate(event.date.value, locale)}</p>
          <h4 className="mt-1 font-heading text-lg font-semibold">{event.title}</h4>
          <p className="mt-1 max-w-2xl text-moon-dust">{event.description}</p>
          {event.date.note && <p className="mt-1 text-xs text-moon-dust">{event.date.note}</p>}
          <SourceBadge sourceIds={event.date.sourceIds} sources={sources} />
          {event.media.length > 0 && (
            <ul className="mt-3 grid max-w-3xl gap-3 sm:grid-cols-2" aria-label={t('gallery.timelineMedia', { event: event.title })}>
              {event.media.slice(0, 2).map((media) => (
                <li key={media.id}>
                  <MediaFigure media={media} imageClassName="aspect-video rounded-lg" />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
