import { api } from '@/api/client'
import { LoadState } from '@/components/common/LoadState'
import { MediaFigure } from '@/components/media/MediaFigure'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'

/** TIMELINE-001: the mission step by step, with a date, a plain explanation and images. */
export function MissionTimeline({ missionId }: { missionId: string }) {
  const { t, locale } = useTranslation()
  const mission = useApi(`mission:${missionId}`, (lang, signal) => api.mission(missionId, lang, signal))

  if (mission.status !== 'success') return <LoadState status={mission.status} onRetry={mission.retry} />

  return (
    <ol aria-label={t('destination.timelineTitle')} className="relative space-y-8 border-l border-stellar-cyan/40 pl-6">
      {mission.data.timeline.map((event) => (
        <li key={event.id} className="relative">
          <span aria-hidden="true" className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full border-2 border-stellar-cyan bg-void" />
          <p className="font-mono text-xs uppercase tracking-widest text-stellar-cyan">
            <time dateTime={event.date.value}>{formatPartialDate(event.date.value, locale)}</time>
          </p>
          <h4 className="mt-1 text-lg font-semibold">{event.title}</h4>
          <p className="mt-1 max-w-2xl text-moon-dust">{event.description}</p>
          {event.media.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {event.media.map((m) => (
                <MediaFigure key={m.id} media={m} />
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
