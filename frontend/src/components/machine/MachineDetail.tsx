import { Dialog } from '@base-ui/react/dialog'
import { BookOpen, X } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/feedback/LoadState'
import { MediaFigure } from '@/components/media/MediaFigure'
import { RelationCard } from '@/components/story/RelationCard'
import { useApiResource } from '@/hooks/useApiResource'
import { useTranslation } from '@/i18n'
import { anchors } from '@/lib/anchors'
import { api } from '@/lib/api'
import { buildContentIndex, pickCover } from '@/lib/contentIndex'
import { formatCoordinates, formatPartialDate } from '@/lib/format'
import type { MachineDetailData } from '@/types/content'
import { FactRow } from './FactRow'
import { StatusBadge } from './StatusBadge'

interface MachineDetailProps {
  /** Machine to show; null keeps the dialog closed. */
  machineId: string | null
  onClose: () => void
}

/**
 * Details of a machine in a modal dialog (EQUIP-002/003/005): full screen on phones, side
 * panel on larger screens. Escape and "Close" return the focus to the card that opened it.
 */
export function MachineDetail({ machineId, onClose }: MachineDetailProps) {
  const { t, locale } = useTranslation()
  const resource = useApiResource(machineId && `machine:${machineId}:${locale}`, (signal) =>
    api.machine(machineId ?? '', locale, signal),
  )

  return (
    <Dialog.Root open={machineId !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-void/75 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          aria-label={resource.status === 'success' ? undefined : t('machine.detailsLabel')}
          finalFocus={() => (machineId ? document.getElementById(anchors.machineCard(machineId)) : null) ?? true}
          className="fixed inset-0 z-50 overflow-y-auto bg-deep-space text-starlight outline-none transition-transform duration-200 data-[ending-style]:translate-x-6 data-[starting-style]:translate-x-6 motion-reduce:transition-none sm:left-auto sm:w-[min(36rem,100vw)] sm:border-l sm:border-stellar-border"
        >
          <div className="sticky top-0 z-10 flex justify-end bg-deep-space/90 p-2 backdrop-blur">
            <Dialog.Close className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-moon-dust hover:text-starlight">
              <X aria-hidden className="size-4" />
              {t('common.close')}
            </Dialog.Close>
          </div>
          <div className="px-5 pb-10">
            {resource.status === 'success' ? (
              <MachineDetailBody data={resource.data} />
            ) : (
              <LoadState status={resource.status === 'loading' ? 'loading' : 'error'} onRetry={resource.retry} />
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const MORE_MEDIA = 4

function MachineDetailBody({ data: machine }: { data: MachineDetailData }) {
  const { t, locale } = useTranslation()
  const { mission, relations, storyTarget: story } = machine
  const { sources } = buildContentIndex(machine)
  const cover = pickCover(machine.media)
  const more = machine.media.filter((item) => item !== cover).slice(0, MORE_MEDIA)

  return (
    <>
      {cover && <MediaFigure media={cover} priority className="-mx-5 mb-5" imageClassName="max-h-72" />}
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-stellar-cyan">
        {t(`machineType.${machine.type}`)}
      </p>
      <Dialog.Title className="mt-1 font-heading text-3xl font-bold">{machine.name}</Dialog.Title>
      <Dialog.Description className="mt-2 text-moon-dust">
        {mission && t('story.missionLabel', { mission: mission.name })}
      </Dialog.Description>

      <dl className="mt-6 rounded-xl bg-nebula-surface/60 px-4 py-1">
        <FactRow label={t('machine.status')} fact={machine.status} sources={sources}>
          <StatusBadge status={machine.status.value} />
        </FactRow>
        {machine.date && (
          <FactRow label={t(`dateLabel.${machine.dateLabel ?? 'default'}`)} fact={machine.date} sources={sources} mono>
            {formatPartialDate(machine.date.value, locale)}
          </FactRow>
        )}
        {machine.locationName && (
          <FactRow label={t('machine.location')} fact={machine.locationName} sources={sources}>
            {machine.locationName.value}
          </FactRow>
        )}
        {machine.coordinates ? (
          <FactRow label={t('machine.coordinates')} fact={machine.coordinates} sources={sources} mono>
            {formatCoordinates(machine.coordinates.value, t)}
          </FactRow>
        ) : (
          <div className="border-t border-stellar-border/50 py-3">
            <dt className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-moon-dust">{t('machine.coordinates')}</dt>
            <dd className="mt-1 text-moon-dust">{t('gallery.locationNotMapped')}</dd>
          </div>
        )}
        {machine.scienceSummary && (
          <FactRow label={t('machine.science')} fact={machine.scienceSummary} sources={sources}>
            {machine.scienceSummary.value}
          </FactRow>
        )}
        {machine.nssdcaId && (
          <div className="border-t border-stellar-border/50 py-3">
            <dt className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-moon-dust">{t('machine.nssdcaId')}</dt>
            <dd className="mt-1 font-mono text-sm">{machine.nssdcaId}</dd>
          </div>
        )}
      </dl>

      {relations.length > 0 && (
        <section aria-labelledby="machine-relations" className="mt-8">
          <h3 id="machine-relations" className="font-heading text-xl font-semibold">
            {t('machine.relationsTitle')}
          </h3>
          <div className="mt-3 space-y-3">
            {relations.map((relation) => (
              <RelationCard key={relation.id} relation={relation} sources={sources} headingLevel="h4" />
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="machine-media" className="mt-8">
          <h3 id="machine-media" className="font-heading text-xl font-semibold">
            {t('machine.mediaTitle')}
          </h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {more.map((item) => (
              <li key={item.id}>
                <MediaFigure media={item} imageClassName="aspect-video rounded-lg" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {story && (
        <Link
          to={paths.story(story.id, { from: machine.id })}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cosmic-indigo px-5 font-semibold text-void hover:bg-cosmic-indigo/85 sm:w-auto"
        >
          <BookOpen aria-hidden className="size-4" />
          {t('machine.discoverStory')}
          {story.status === 'draft' && <span className="font-normal">· {t('common.draft')}</span>}
        </Link>
      )}
    </>
  )
}
