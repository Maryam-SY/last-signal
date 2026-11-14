import { useEffect, useId, useRef } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { api } from '@/api/client'
import type { Machine, StorySummary } from '@/api/types'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/common/LoadState'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { MediaFigure } from '@/components/media/MediaFigure'
import { RelationEnds } from '@/components/relations/RelationEnds'
import { SourceList } from '@/components/sources/SourceList'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'

interface MachineCardProps {
  machine: Machine
  /** Story to open from this card (STORY-003): the machine's own story, else its mission's. */
  story: StorySummary | null
}

/**
 * EQUIP-002: summary of one machine; photos, videos, relations and sources load when the
 * visitor asks. The open card lives in the URL (?machine=<id>, US-3.2): it can be shared,
 * reloaded, and reached from "Exit story". Escape closes it and gives the focus back.
 */
export function MachineCard({ machine, story }: MachineCardProps) {
  const { t, locale } = useTranslation()
  const [params, setParams] = useSearchParams()
  const open = params.get('machine') === machine.id
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  const setOpen = (value: boolean) => {
    const next = new URLSearchParams(params)
    if (value) next.set('machine', machine.id)
    else next.delete('machine')
    // replace: opening details is a selection, not a new page in the history (ARCHITECTURE §4).
    setParams(next, { replace: true, preventScrollReset: true })
  }

  // Escape closes the open details when the focus is anywhere in this card (US-3.2 criterion 3).
  const closeRef = useRef(() => setOpen(false))
  useEffect(() => {
    closeRef.current = () => setOpen(false)
  })
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !cardRef.current?.contains(document.activeElement)) return
      closeRef.current()
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <article ref={cardRef} id={`machine-${machine.id}`} className="scroll-mt-24 rounded-xl border border-moon-dust/30 bg-card p-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-stellar-cyan">{t(`machineType.${machine.type}`)}</p>
      <h4 className="mt-2 font-heading text-xl font-bold">{machine.name}</h4>

      <dl className="mt-3 space-y-1.5 text-sm">
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

      {machine.scienceSummary && <p className="mt-3">{machine.scienceSummary.value}</p>}
      {machine.status.note && <p className="mt-2 text-sm text-moon-dust">{machine.status.note}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {story && (
          <Link
            to={`${paths.story(story.id)}?from=${encodeURIComponent(machine.id)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
          >
            {t('destination.discoverStory')}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 items-center rounded-md border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface"
        >
          {open ? t('destination.detailsHide') : t('destination.detailsShow')}
        </button>
      </div>

      <div id={panelId} hidden={!open} className="mt-4">
        {open && <MachineDetails machineId={machine.id} />}
      </div>
    </article>
  )
}

function MachineDetails({ machineId }: { machineId: string }) {
  const { t } = useTranslation()
  const detail = useApi(`machine:${machineId}`, (lang, signal) => api.machine(machineId, lang, signal))

  if (detail.status !== 'success') return <LoadState status={detail.status} onRetry={detail.retry} />

  return (
    <div className="space-y-4">
      {detail.data.media.length === 0 ? (
        <p className="text-sm text-moon-dust">{t('destination.noMedia')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {detail.data.media.map((m) => (
            <MediaFigure key={m.id} media={m} />
          ))}
        </div>
      )}
      {detail.data.relations.length > 0 && (
        <section>
          <h5 className="mb-2 text-sm font-semibold">{t('story.relationsTitle')}</h5>
          <ul className="space-y-3">
            {detail.data.relations.map((relation) => (
              <li key={relation.id} className="rounded-md border border-stellar-cyan/30 bg-deep-space p-3 text-sm">
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
      <section>
        <h5 className="mb-2 text-sm font-semibold">{t('sources.count', { count: detail.data.sources.length })}</h5>
        <SourceList sources={detail.data.sources} />
      </section>
    </div>
  )
}
