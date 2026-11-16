import { CircleCheck, CircleDashed, CircleOff, CircleStop, Unplug } from 'lucide-react'
import type { MachineStatus } from '@/api/types'
import { useTranslation } from '@/i18n'

const ICONS = {
  operational: CircleCheck,
  'contact-lost': Unplug,
  inactive: CircleOff,
  'mission-ended': CircleStop,
  unknown: CircleDashed,
} as const

/** EQUIP-005: status shown as icon + text, never by colour alone. */
export function StatusBadge({ status }: { status: MachineStatus }) {
  const { t } = useTranslation()
  const Icon = ICONS[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Icon aria-hidden="true" className="size-4 text-cosmic-cyan" />
      {t(`status.${status}`)}
    </span>
  )
}
