import type { Lifespan, LifespanUnit, Sourced } from '@/api/types'

/**
 * Pure helpers for a machine's life (US-5.12): only arithmetic on sourced dates and amounts
 * served by the API — no fact is created here.
 */

/** A Mars solar day, in Earth days (used only to compare a plan in sols with a real span). */
const SOL_IN_DAYS = 1.0275
const DAY_MS = 86_400_000

/** Full ISO date (YYYY-MM-DD) → UTC milliseconds; partial dates are not precise enough. */
function toTime(value: string | null | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.UTC(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
  return Number.isNaN(time) ? null : time
}

/** Whole days from one full date to another (null if either is missing or partial). */
export function daysBetween(from: string | null | undefined, to: string | null | undefined): number | null {
  const start = toTime(from)
  const end = toTime(to)
  if (start === null || end === null || end < start) return null
  return Math.round((end - start) / DAY_MS)
}

/** The day the machine fell silent: its last contact, else the official end of its mission. */
export function lastSignal(lifespan: Lifespan | null | undefined): Sourced<string> | null {
  return lifespan?.lastContact ?? lifespan?.missionEnd ?? null
}

/** Planned duration in Earth days, when the plan is a duration (not a number of flights). */
export function plannedDays(planned: { amount: number; unit: LifespanUnit } | null | undefined): number | null {
  if (!planned) return null
  switch (planned.unit) {
    case 'days':
      return planned.amount
    case 'sols':
      return planned.amount * SOL_IN_DAYS
    case 'years':
      return planned.amount * 365.25
    default:
      return null
  }
}

/** How many times longer than planned it lived (≥ 1.5 only; otherwise null: nothing to tell). */
export function beyondPlan(lifespan: Lifespan | null | undefined, born: string | null | undefined): number | null {
  const planned = plannedDays(lifespan?.planned?.value)
  const lived = daysBetween(born, lastSignal(lifespan)?.value)
  if (!planned || lived === null) return null
  const ratio = lived / planned
  return ratio >= 1.5 ? ratio : null
}

/** Days → years, months and days, for display. */
export function splitDuration(days: number): { years: number; months: number; days: number } {
  const years = Math.floor(days / 365.25)
  const rest = days - years * 365.25
  const months = Math.floor(rest / 30.44)
  return { years, months, days: Math.max(0, Math.round(rest - months * 30.44)) }
}
