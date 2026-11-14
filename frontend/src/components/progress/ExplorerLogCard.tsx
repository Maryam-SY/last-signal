import { Award, BookOpenCheck, Globe2, Microscope, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { api } from '@/api/client'
import { useApi } from '@/hooks/useApi'
import { useTranslation, type MessageKey } from '@/i18n'
import { resetExplorerLog, useExplorerLog } from '@/lib/explorerLog'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { DESTINATION_IDS } from '@/types/content'

interface Badge {
  id: string
  name: MessageKey
  help: MessageKey
  earned: boolean
}

/**
 * US-5.8: the visitor's progress (worlds, stories, machines) and four badges. Totals come
 * from the API; progress from this browser only. Text always says earned / not yet earned.
 */
export function ExplorerLogCard({ className }: { className?: string }) {
  const { t } = useTranslation()
  const log = useExplorerLog()
  const destinations = useApi('destinations', (lang, signal) => api.destinations(lang, signal))
  const stories = useApi('stories', (lang, signal) => api.stories(lang, signal))

  const totalWorlds = DESTINATION_IDS.length
  const totalStories = stories.status === 'success' ? stories.data.length : null
  const totalMachines = destinations.status === 'success' ? destinations.data.reduce((sum, d) => sum + d.machineCount, 0) : null
  const worlds = log.worlds.filter((w) => (DESTINATION_IDS as readonly string[]).includes(w)).length

  const badges: Badge[] = [
    { id: 'first-landing', name: 'log.badgeFirstLanding', help: 'log.badgeFirstLandingHelp', earned: worlds >= 1 },
    { id: 'two-worlds', name: 'log.badgeTwoWorlds', help: 'log.badgeTwoWorldsHelp', earned: worlds >= totalWorlds },
    { id: 'storyteller', name: 'log.badgeStoryteller', help: 'log.badgeStorytellerHelp', earned: log.stories.length >= 1 },
    {
      id: 'archivist',
      name: 'log.badgeArchivist',
      help: 'log.badgeArchivistHelp',
      earned: totalStories !== null && totalStories > 0 && log.stories.length >= totalStories,
    },
  ]

  return (
    <section aria-labelledby="explorer-log-title" className={cn('glass rounded-2xl p-5 text-left sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="explorer-log-title" className="font-heading text-xl font-bold">
            {t('log.title')}
          </h2>
          <p className="mt-1 text-sm text-moon-dust">{t('log.intro')}</p>
        </div>
        <button
          type="button"
          onClick={resetExplorerLog}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-medium text-moon-dust transition-colors hover:text-starlight"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          {t('log.reset')}
        </button>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <Meter icon={<Globe2 className="size-4" />} label={t('log.worlds')} count={worlds} total={totalWorlds} />
        <Meter icon={<BookOpenCheck className="size-4" />} label={t('log.stories')} count={log.stories.length} total={totalStories} />
        <Meter icon={<Microscope className="size-4" />} label={t('log.machines')} count={log.machines.length} total={totalMachines} />
      </dl>

      <h3 className={cn(eyebrow, 'mt-6 text-moon-dust')}>{t('log.badgesTitle')}</h3>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border p-3 text-center',
              badge.earned ? 'border-stellar-gold/60 bg-stellar-gold/10' : 'border-dashed border-moon-dust/30',
            )}
          >
            <Award aria-hidden="true" className={cn('size-6', badge.earned ? 'text-stellar-gold' : 'text-moon-dust/50')} />
            <span className="text-sm font-semibold">{t(badge.name)}</span>
            <span className="text-xs text-moon-dust">{t(badge.help)}</span>
            <span className={cn('font-mono text-[0.62rem] tracking-widest uppercase', badge.earned ? 'text-stellar-gold' : 'text-moon-dust')}>
              {badge.earned ? t('log.earned') : t('log.locked')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Meter({ icon, label, count, total }: { icon: ReactNode; label: string; count: number; total: number | null }) {
  const { t } = useTranslation()
  const ratio = total ? Math.min(1, count / total) : 0
  return (
    <div>
      <dt className="flex items-center gap-2 text-sm text-moon-dust">
        <span aria-hidden="true" className="text-world">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-1">
        <span className="font-mono text-lg">{total === null ? count : t('log.progress', { count, total })}</span>
        <span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-moon-dust/20">
          <span className="block h-full origin-left rounded-full bg-world transition-transform duration-500" style={{ transform: `scaleX(${ratio})` }} />
        </span>
      </dd>
    </div>
  )
}
