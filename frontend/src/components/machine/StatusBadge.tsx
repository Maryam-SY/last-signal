import { CircleCheck, CircleHelp, CirclePause, CircleStop, RadioTower, type LucideIcon } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { MachineStatus } from '@/types/content'

const STATUS: Record<MachineStatus, { icon: LucideIcon; className: string }> = {
  operational: { icon: CircleCheck, className: 'text-stellar-cyan border-stellar-cyan/60' },
  'contact-lost': { icon: RadioTower, className: 'text-stellar-gold border-stellar-gold/50' },
  inactive: { icon: CirclePause, className: 'text-moon-dust border-moon-dust/50' },
  'mission-ended': { icon: CircleStop, className: 'text-starlight border-moon-dust/70' },
  unknown: { icon: CircleHelp, className: 'text-moon-dust border-dashed border-moon-dust/50' },
}

/** Status = icon + text; colour is only a reinforcement (EQUIP-005, NFR-A11Y-004). */
export function StatusBadge({ status, className }: { status: MachineStatus; className?: string }) {
  const { t } = useTranslation()
  const { icon: Icon, className: statusClass } = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        statusClass,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(`status.${status}`)}
    </span>
  )
}
