import type { MissionDetail } from '@/api/types'
import { MediaFigure } from '@/components/media/MediaFigure'
import { Reveal } from '@/components/motion/Reveal'
import { SourceList } from '@/components/sources/SourceList'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { toldPicture } from '@/lib/journey'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

/**
 * TIMELINE-001, told as a story (US-5.9): each moment of the mission — launch, landing, what
 * the machines did, how it ended — with its date, its plain-language account and **one**
 * picture of that moment, captioned "What you see". The text leads; the picture illustrates
 * it. Nothing to open, nothing to click: it all unfolds while scrolling.
 */
export function MissionTimeline({ mission }: { mission: MissionDetail }) {
  const { t, locale } = useTranslation()
  if (mission.timeline.length === 0) return null

  return (
    <div>
      <p className={cn(eyebrow, 'text-world')}>{t('destination.chronicleEyebrow')}</p>
      <ol aria-label={t('destination.timelineTitle')} className="relative mt-8 space-y-16 sm:space-y-24">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.45rem] w-px bg-gradient-to-b from-world/70 via-world/25 to-transparent" />
        {mission.timeline.map((event, index) => {
          // The picture whose story we can tell, otherwise the first one (US-5.10).
          const picture = toldPicture(event.media)
          const flipped = index % 2 === 1
          return (
            <li key={event.id} className="relative pl-8 sm:pl-12">
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-0 size-[0.95rem] rounded-full border-2 border-world bg-void shadow-[0_0_12px_var(--world-accent)]"
              />
              <div className={cn('grid items-center gap-6', picture && 'lg:grid-cols-2 lg:gap-12')}>
                <Reveal className={cn(picture && flipped && 'lg:order-2')}>
                  <p className="font-mono text-sm text-world">
                    <time dateTime={event.date.value}>{formatPartialDate(event.date.value, locale)}</time>
                  </p>
                  <h4 className="mt-1 font-heading text-2xl font-bold sm:text-4xl">{event.title}</h4>
                  <p className="mt-3 text-lg leading-relaxed text-starlight/90 sm:text-xl">{event.description}</p>
                </Reveal>
                {picture && (
                  <Reveal delay={120}>
                    <MediaFigure media={picture} lead={t('media.whatYouSee')} withStory className="rounded-2xl" />
                  </Reveal>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {mission.timeline.some((e) => toldPicture(e.media)?.descriptionStatus === 'draft') && (
        <p className="mt-10 pl-8 text-xs text-moon-dust/80 sm:pl-12">{t('destination.pictureStoriesDraft')}</p>
      )}

      {mission.sources && mission.sources.length > 0 && (
        <section aria-label={t('destination.missionSources', { count: mission.sources.length })} className="mt-12 pl-8 sm:pl-12">
          <p className={cn(eyebrow, 'mb-3 text-moon-dust')}>{t('destination.missionSources', { count: mission.sources.length })}</p>
          <SourceList sources={mission.sources} />
        </section>
      )}
    </div>
  )
}
