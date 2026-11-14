import type { MissionDetail } from '@/api/types'
import { PhotoFlight } from '@/components/journey/PhotoFlight'
import { SourcesDisclosure } from '@/components/sources/SourcesDisclosure'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { toldPicture } from '@/lib/journey'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

/**
 * TIMELINE-001, told as a story (US-5.9): each moment of the mission — launch, landing, what
 * the machines did, how it ended — with its date, its plain-language account and **one**
 * picture of that moment, captioned "What you see". Scrolling flies down a corridor of these
 * pictures (PhotoFlight, US-5.11). Nothing to open, nothing to click.
 */
export function MissionTimeline({ mission }: { mission: MissionDetail }) {
  const { t, locale } = useTranslation()
  if (mission.timeline.length === 0) return null

  return (
    <div>
      <p className={cn(eyebrow, 'text-world')}>{t('destination.chronicleEyebrow')}</p>
      <PhotoFlight
        label={t('destination.timelineTitle')}
        className="mt-6"
        items={mission.timeline.map((event) => ({
          id: event.id,
          // The picture whose story we can tell, otherwise the first one (US-5.10).
          media: toldPicture(event.media),
          content: (
            <>
              <p className="font-mono text-sm text-world">
                <time dateTime={event.date.value}>{formatPartialDate(event.date.value, locale)}</time>
              </p>
              <h4 className="mt-1 font-heading text-2xl leading-tight font-bold sm:text-4xl">{event.title}</h4>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-starlight/90 sm:text-lg">{event.description}</p>
            </>
          ),
        }))}
      />

      {mission.timeline.some((e) => toldPicture(e.media)?.descriptionStatus === 'draft') && (
        <p className="mt-6 text-xs text-moon-dust/80">{t('destination.pictureStoriesDraft')}</p>
      )}

      {mission.sources && mission.sources.length > 0 && (
        <SourcesDisclosure
          sources={mission.sources}
          label={t('destination.missionSources', { count: mission.sources.length })}
          className="mt-6"
        />
      )}
    </div>
  )
}
