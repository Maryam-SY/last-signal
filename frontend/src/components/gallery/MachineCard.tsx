import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { api } from '@/api/client'
import type { Machine, StorySummary } from '@/api/types'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/common/LoadState'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { CoverPhoto } from '@/components/media/CoverPhoto'
import { RelationEnds } from '@/components/relations/RelationEnds'
import { SourceList } from '@/components/sources/SourceList'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from '@/i18n'
import { record } from '@/lib/explorerLog'
import { formatPartialDate } from '@/lib/formatDate'
import { ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface MachineCardProps {
  machine: Machine
  /** Story to open from this card (STORY-003): the machine's own story, else its mission's. */
  story: StorySummary | null
  /** False when a stage next to the card already shows the machine's picture (MachineJourney). */
  showCover?: boolean
}

/**
 * EQUIP-002, told as a short story (US-5.9): one photo of the machine, then what it did,
 * what became of it and what it passed on — each a sourced fact from the content, under a
 * plain heading. No gallery: pictures belong to the moments of the mission log above.
 * `?machine=<id>` (US-3.2, map, "Exit story") selects it: highlighted and brought into view.
 */
export function MachineCard({ machine, story, showCover = true }: MachineCardProps) {
  const { t, locale } = useTranslation()
  const [params] = useSearchParams()
  const selected = params.get('machine') === machine.id
  const cardRef = useRef<HTMLElement>(null)

  // Explorer log (US-5.8): a machine scrolled into view, or selected, has been examined.
  useEffect(() => {
    const card = cardRef.current
    if (selected) record('machines', machine.id)
    if (!card || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        record('machines', machine.id)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [machine.id, selected])

  return (
    <article
      ref={cardRef}
      id={`machine-${machine.id}`}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'glass relative scroll-mt-24 overflow-hidden rounded-3xl transition-[border-color,box-shadow] duration-300',
        // SYNC-001/002: the selected machine stands out (outline + glow, not colour alone).
        selected && 'border-world shadow-[0_0_0_2px_var(--world-accent),0_20px_60px_-20px_var(--world-accent)]',
      )}
    >
      <div className={cn('grid', showCover && machine.cover && 'lg:grid-cols-[1.1fr_1fr]')}>
        {showCover && machine.cover && <CoverPhoto media={machine.cover} className="aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-full" />}

        <div className="p-5 sm:p-8">
          <p className={cn(eyebrow, 'text-world')}>{t(`machineType.${machine.type}`)}</p>
          <h4 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">{machine.name}</h4>

          <dl className="mt-4 space-y-2 text-sm">
            {machine.date && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-moon-dust">{t(`dateLabel.${machine.dateLabel ?? 'landing'}`)}</dt>
                <dd className="font-mono">
                  <time dateTime={machine.date.value}>{formatPartialDate(machine.date.value, locale)}</time>
                </dd>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="sr-only">{t('status.label')}</dt>
              <dd>
                <StatusBadge status={machine.status.value} />
              </dd>
            </div>
            <div className="flex items-start gap-1.5 text-moon-dust">
              <dt className="sr-only">{t('destination.location')}</dt>
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <dd>
                {machine.locationName?.value}
                {!machine.coordinates && <span className="block text-xs">{t('destination.locationNotMapped')}</span>}
              </dd>
            </div>
          </dl>

          {machine.scienceSummary && (
            <Chapter title={t('destination.whatItDid')}>
              <p className="text-lg leading-relaxed">{machine.scienceSummary.value}</p>
            </Chapter>
          )}
          {machine.status.note && (
            <Chapter title={t('destination.whatBecame')}>
              <p className="leading-relaxed text-starlight/90">{machine.status.note}</p>
            </Chapter>
          )}

          {story && (
            <Link to={`${paths.story(story.id)}?from=${encodeURIComponent(machine.id)}`} className={cn(ctaPrimary, 'mt-6')}>
              {t('destination.discoverStory')}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 p-5 sm:p-8">
        <MachineDetails machineId={machine.id} />
      </div>
    </article>
  )
}

function Chapter({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h5 className={cn(eyebrow, 'text-moon-dust')}>{title}</h5>
      <div className="mt-2">{children}</div>
    </section>
  )
}

/** What the machine passed on (relations) and its sources — loaded with the machine's details. */
function MachineDetails({ machineId }: { machineId: string }) {
  const { t } = useTranslation()
  const detail = useApi(`machine:${machineId}`, (lang, signal) => api.machine(machineId, lang, signal))

  if (detail.status !== 'success') return <LoadState status={detail.status} onRetry={detail.retry} />

  return (
    <div className="space-y-8">
      {detail.data.relations.length > 0 && (
        <section aria-label={t('story.relationsTitle')}>
          <h5 className={cn(eyebrow, 'mb-3 text-moon-dust')}>{t('story.relationsTitle')}</h5>
          <ul className="grid gap-3 md:grid-cols-2">
            {detail.data.relations.map((relation) => (
              <li key={relation.id} className="rounded-2xl border border-world/30 bg-void/40 p-4 text-sm">
                <RelationEnds relation={relation} />
                <p className="mt-1">{relation.transmitted}</p>
                <p className="mt-1 text-moon-dust">
                  <span className="font-semibold">{t('story.evidence')} </span>
                  {relation.evidence}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label={t('sources.count', { count: detail.data.sources.length })}>
        <p className={cn(eyebrow, 'mb-3 text-moon-dust')}>{t('sources.count', { count: detail.data.sources.length })}</p>
        <SourceList sources={detail.data.sources} />
      </section>
    </div>
  )
}
