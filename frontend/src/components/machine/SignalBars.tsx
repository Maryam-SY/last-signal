import type { MachineStatus } from '@/api/types'
import { cn } from '@/lib/utils'

/** How many of the five bars a status lights, and whether they move. */
const LEVEL: Record<MachineStatus, { bars: number; live: boolean }> = {
  operational: { bars: 5, live: true },
  'contact-lost': { bars: 1, live: false },
  inactive: { bars: 0, live: false },
  'mission-ended': { bars: 0, live: false },
  unknown: { bars: 2, live: false },
}

/**
 * Signal strength bars for a machine's status (US-5.14 art direction): full and moving when
 * it still answers, dark when it fell silent. Decorative — the status is always written next
 * to it (EQUIP-005: never colour or shape alone).
 */
export function SignalBars({ status, className }: { status: MachineStatus; className?: string }) {
  const { bars, live } = LEVEL[status]
  return (
    <span aria-hidden="true" className={cn('signal-bars', live && 'is-live', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <i key={index} className={index < bars ? 'is-on' : undefined} style={{ '--i': index } as React.CSSProperties} />
      ))}
    </span>
  )
}
