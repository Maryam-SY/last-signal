import { BookOpen, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { SourceBadge } from '@/components/sources/SourceBadge'
import { useTranslation } from '@/i18n'
import { anchors } from '@/lib/anchors'
import { formatPartialDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Media, MissionWithMachines, Source } from '@/types/content'
import { MachineCard } from './MachineCard'
import { MissionTimeline } from './MissionTimeline'

interface MissionGroupProps {
  mission: MissionWithMachines
  covers: ReadonlyMap<string, Media>
  sources: ReadonlyMap<string, Source>
  selectedId: string | null
  onSelect: (machineId: string) => void
}

/** One mission, its story, its key moments and the machines it left (EXPL-001, EQUIP-001). */
export function MissionGroup({ mission, covers, sources, selectedId, onSelect }: MissionGroupProps) {
  const { t, locale } = useTranslation()
  const [timelineOpen, setTimelineOpen] = useState(false)
  const timelineId = useId()
  const period = mission.period
  const headingId = `${anchors.mission(mission.id)}-title`

  return (
    <section id={anchors.mission(mission.id)} aria-labelledby={headingId} className="scroll-mt-24">
      <div className="flex flex-col gap-2 border-l-2 border-stellar-cyan/70 pl-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-moon-dust">{mission.agency.join(' · ')}</p>
          <h3 id={headingId} tabIndex={-1} className="mt-1 font-heading text-2xl font-bold sm:text-3xl">
            {mission.name}
          </h3>
        </div>
        {period && (
          <p className="font-mono text-sm text-stellar-gold">
            {period.value.end
              ? t('gallery.period', {
                  start: formatPartialDate(period.value.start, locale),
                  end: formatPartialDate(period.value.end, locale),
                })
              : formatPartialDate(period.value.start, locale)}
          </p>
        )}
      </div>

      <div className="mt-3 max-w-3xl pl-4">
        <p className="text-moon-dust">{mission.summary}</p>
        <SourceBadge sourceIds={mission.sourceIds} sources={sources} />
        <div className="mt-2 flex flex-wrap gap-3">
          {mission.mainStory && (
            <Link
              to={paths.story(mission.mainStory.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cosmic-indigo px-4 text-sm font-semibold text-void hover:bg-cosmic-indigo/85"
            >
              <BookOpen aria-hidden className="size-4" />
              {t('gallery.discoverStory')}
              {mission.mainStory.status === 'draft' && <span className="font-normal">· {t('common.draft')}</span>}
            </Link>
          )}
          {mission.timeline.length > 0 && (
            <button
              type="button"
              aria-expanded={timelineOpen}
              aria-controls={timelineId}
              onClick={() => setTimelineOpen((open) => !open)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-moon-dust/60 px-4 text-sm font-medium hover:border-starlight"
            >
              {t('gallery.timeline', { count: mission.timeline.length })}
              <ChevronDown aria-hidden className={cn('size-4 transition-transform motion-reduce:transition-none', timelineOpen && 'rotate-180')} />
            </button>
          )}
        </div>
        <div id={timelineId} hidden={!timelineOpen}>
          {timelineOpen && <MissionTimeline missionId={mission.id} sources={sources} />}
        </div>
      </div>

      <ul aria-label={t('gallery.machinesLabel', { mission: mission.name })} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mission.machines.map((machine) => (
          <li key={machine.id}>
            <MachineCard machine={machine} cover={covers.get(machine.id)} selected={machine.id === selectedId} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  )
}
