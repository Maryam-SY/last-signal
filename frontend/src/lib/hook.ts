import type { Machine } from '@/api/types'
import type { MessageKey } from '@/i18n'
import { beyondPlan, daysBetween, lastSignal } from './lifespan'

/** The one sentence that makes a visitor want to open a machine (US-5.15), as an i18n key + vars. */
export interface Hook {
  key: MessageKey
  vars: Record<string, string | number>
}

/**
 * Picks the strongest sourced fact of a machine's life as a teaser: still answering after all
 * these years, lived N times longer than planned, or fell silent after N days. Only arithmetic
 * on content the API serves; null when the content tells nothing of the kind.
 */
export function machineHook(machine: Pick<Machine, 'date' | 'lifespan'>): Hook | null {
  const born = machine.date?.value
  if (machine.lifespan?.stillWorking?.value && born) return { key: 'hook.alive', vars: { year: born.slice(0, 4) } }
  const ratio = beyondPlan(machine.lifespan, born)
  if (ratio) return { key: 'hook.beyond', vars: { times: Math.round(ratio) } }
  const lived = daysBetween(born, lastSignal(machine.lifespan)?.value)
  if (lived !== null && lived > 0) return { key: 'hook.days', vars: { days: lived } }
  return null
}
