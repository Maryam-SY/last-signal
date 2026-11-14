import { ImageOff, MapPinOff } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { useTranslation } from '@/i18n'
import { anchors } from '@/lib/anchors'
import { formatPartialDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Machine, Media } from '@/types/content'

interface MachineCardProps {
  machine: Machine
  cover: Media | undefined
  selected: boolean
  onSelect: (machineId: string) => void
}

/** Summary of one machine; the whole card is a single button that opens its details. */
export function MachineCard({ machine, cover, selected, onSelect }: MachineCardProps) {
  const { t, locale } = useTranslation()
  const [coverFailed, setCoverFailed] = useState(false)
  const dateLabel = t(`dateLabel.${machine.dateLabel ?? 'default'}`)

  return (
    <button
      type="button"
      id={anchors.machineCard(machine.id)}
      aria-haspopup="dialog"
      aria-label={t('gallery.openDetails', { machine: machine.name })}
      onClick={() => onSelect(machine.id)}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-xl border-2 bg-nebula-surface text-left transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_oklch,var(--cosmos-nebula-surface),white_6%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        selected ? 'border-stellar-cyan' : 'border-transparent',
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-deep-space">
        {cover && !coverFailed ? (
          <>
            <img
              src={cover.url}
              alt={cover.alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setCoverFailed(true)}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <DepictionBadge media={cover} className="absolute left-2 top-2" />
          </>
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-xs text-moon-dust">
            <ImageOff aria-hidden className="size-6" />
            {coverFailed ? t('media.unavailableShort') : t('gallery.noImage')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-stellar-cyan">
            {t(`machineType.${machine.type}`)}
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-starlight">{machine.name}</h3>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <StatusBadge status={machine.status.value} />
          {machine.date && (
            <span className="font-mono text-xs text-moon-dust">
              {dateLabel} · {formatPartialDate(machine.date.value, locale)}
            </span>
          )}
        </div>
        {!machine.coordinates && (
          <p className="flex items-center gap-1.5 text-xs text-moon-dust">
            <MapPinOff aria-hidden className="size-3.5" />
            {t('gallery.locationNotMapped')}
          </p>
        )}
      </div>
    </button>
  )
}
