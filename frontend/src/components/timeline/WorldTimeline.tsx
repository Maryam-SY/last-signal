import type { DestinationDetail, TimelineEvent } from '@/api/types'
import { Reveal } from '@/components/motion/Reveal'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { groupByYear } from './groupByYear'

type WorldEvent = TimelineEvent & { missionName: string }

/**
 * US-5.13: the timeline of one world only — every dated step of its missions (launches,
 * landings, discoveries, last signals), oldest first, on one line. The gaps between years are
 * spelled out. Dates, titles and texts come from the sourced mission timelines.
 */
export function WorldTimeline({ destination }: { destination: DestinationDetail }) {
  const { t, locale } = useTranslation()
  const events: WorldEvent[] = destination.missions
    .flatMap((mission) => mission.timeline.map((event) => ({ ...event, missionName: mission.name })))
    .sort((a, b) => a.date.value.localeCompare(b.date.value))
  if (events.length === 0) return null
  const groups = groupByYear(events)

  return (
    <ol aria-label={t('timeline.worldLabel', { destination: destination.name })} className="relative mx-auto max-w-3xl space-y-10">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-gradient-to-b from-world via-moon-dust/40 to-world/20" />
      {groups.map((group, index) => {
        const previous = groups[index - 1]
        const gap = previous ? group.year - previous.year : null
        return (
          <li key={group.year} className="relative">
            {gap !== null && gap > 0 && (
              <p className="mb-3 pl-8 font-mono text-[0.68rem] tracking-widest text-moon-dust uppercase">
                {gap === 1 ? t('timeline.gapOne') : t('timeline.gap', { years: gap })}
              </p>
            )}
            <p className="relative flex items-center gap-3">
              <span aria-hidden="true" className="relative z-10 size-3 shrink-0 translate-x-[0.2rem] rounded-full border-2 border-world bg-void" />
              <span className="font-mono text-2xl font-medium md:text-3xl">{group.year}</span>
            </p>
            <ul className="mt-4 space-y-3 pl-8">
              {group.entries.map((event) => (
                <li key={event.id}>
                  <Reveal className="reading-panel rounded-2xl p-4 sm:p-5">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <time dateTime={event.date.value} className="font-mono text-xs text-world">
                        {formatPartialDate(event.date.value, locale)}
                      </time>
                      <span className="rounded-full border border-world/40 px-2 py-0.5 font-mono text-[0.6rem] tracking-widest text-world uppercase">
                        {event.missionName}
                      </span>
                    </p>
                    <h3 className="mt-1 font-heading text-lg font-bold sm:text-xl">{event.title}</h3>
                    <p className="mt-1 leading-relaxed text-starlight/90">{event.description}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}
