import { Link } from 'react-router'
import { api } from '@/api/client'
import type { TimelineEntry } from '@/api/types'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/common/LoadState'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { Reveal } from '@/components/motion/Reveal'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import type { DestinationId } from '@/types/content'
import { groupByYear } from './groupByYear'

/**
 * US-5.8: every dated machine of both worlds on one vertical timeline — Moon on the left,
 * Mars on the right (one column with a world label on phones). The gaps between years are
 * spelled out, so the visitor feels the decades between the Apollo era and the rovers.
 * Only sourced dates are shown (they come from the API with their sources).
 */
export function WorldsTimeline({ current }: { current: DestinationId }) {
  const { t } = useTranslation()
  const timeline = useApi('timeline', (lang, signal) => api.timeline(lang, signal))

  if (timeline.status !== 'success') return <LoadState status={timeline.status} onRetry={timeline.retry} />
  const groups = groupByYear(timeline.data)

  return (
    <div className="relative">
      <div aria-hidden="true" className="mb-6 hidden grid-cols-2 gap-16 text-center md:grid">
        <p data-world="moon" className="font-heading text-2xl font-bold text-world">
          {t('destinations.moon.name')}
        </p>
        <p data-world="mars" className="font-heading text-2xl font-bold text-world">
          {t('destinations.mars.name')}
        </p>
      </div>

      <ol aria-label={t('timeline.label')} className="relative space-y-10">
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-gradient-to-b from-stellar-cyan via-moon-dust/40 to-rocky md:left-1/2"
        />
        {groups.map((group, index) => {
          const previous = groups[index - 1]
          const gap = previous ? group.year - previous.year : null
          return (
            <li key={group.year} className="relative">
              {gap !== null && (
                <p className="mb-3 pl-8 font-mono text-[0.68rem] tracking-widest text-moon-dust uppercase md:pl-0 md:text-center">
                  {gap === 1 ? t('timeline.gapOne') : t('timeline.gap', { years: gap })}
                </p>
              )}
              <p className="relative flex items-center gap-3 md:justify-center">
                <span aria-hidden="true" className="relative z-10 size-3 shrink-0 translate-x-[0.2rem] rounded-full border-2 border-starlight bg-void md:translate-x-0" />
                <span className="font-mono text-2xl font-medium md:absolute md:left-1/2 md:ml-6 md:text-3xl">{group.year}</span>
              </p>
              <ul className="mt-4 space-y-3">
                {group.entries.map((entry) => (
                  <TimelineCard key={entry.machineId} entry={entry} current={current} />
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function TimelineCard({ entry, current }: { entry: TimelineEntry; current: DestinationId }) {
  const { t, locale } = useTranslation()
  const isMoon = entry.destinationId === 'moon'
  const isHere = entry.destinationId === current

  return (
    <li data-world={entry.destinationId} className={cn('pl-8 md:w-1/2 md:pl-0', isMoon ? 'md:pr-10' : 'md:ml-auto md:pl-10')}>
      <Reveal>
      <Link
        to={paths.machine(entry.destinationId, entry.machineId)}
        className={cn(
          'glass group block rounded-2xl p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-world/70',
          isHere ? 'border-world/50' : 'opacity-85',
        )}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-xs text-world">
            <time dateTime={entry.date.value}>{formatPartialDate(entry.date.value, locale)}</time>
          </span>
          <span className="rounded-full border border-world/40 px-2 py-0.5 font-mono text-[0.6rem] tracking-widest text-world uppercase">
            {t(`destinations.${entry.destinationId}.name`)}
          </span>
          {isHere && <span className="text-[0.65rem] font-semibold text-starlight">· {t('timeline.here')}</span>}
        </span>
        <span className="mt-1 block font-heading text-lg font-bold group-hover:text-world">{entry.name}</span>
        <span className="block text-sm text-moon-dust">
          {entry.missionName}
          {entry.dateLabel && ` · ${t(`dateLabel.${entry.dateLabel}`)}`}
        </span>
        <span className="mt-2 block">
          <StatusBadge status={entry.status.value} />
        </span>
      </Link>
      </Reveal>
    </li>
  )
}
