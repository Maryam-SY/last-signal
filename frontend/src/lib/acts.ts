import type { Lifespan, LifespanUnit, Sourced } from '@/api/types'
import type { LifeChapter } from './journey'
import { beyondPlan, daysBetween, lastSignal, plannedDays } from './lifespan'

/**
 * The acts of a machine's life (US-5.14): instead of one fixed frame for every machine, the
 * structure of its story comes out of its own sourced dates — when it arrived, how long it was
 * meant to live, when it fell silent, when its mission was declared over, whether it still
 * answers. Only arithmetic on content served by the API; nothing is invented here.
 */
export type ActKey = 'departure' | 'planned' | 'life' | 'beyond' | 'silence' | 'after' | 'alive'

export interface Act {
  key: ActKey
  chapters: LifeChapter[]
  /** First and last dated chapter of the act (full or partial ISO dates). */
  from: string | null
  to: string | null
  /** `beyond`: how many times longer than planned, and the planned length in days. */
  ratio?: number
  plannedDays?: number
  /** `planned`: the announced duration. */
  planned?: { amount: number; unit: LifespanUnit }
  /** `silence`: days between the last signal and the declared end. */
  silentDays?: number
  /** `alive`: the year it started working. */
  since?: string
}

interface MachineLife {
  date: Sourced<string> | null
  lifespan?: Lifespan | null
}

const FULL = /^\d{4}-\d{2}-\d{2}$/

/** ISO date `days` days after a full date. */
function addDays(date: string, days: number): string {
  const time = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))) + Math.round(days) * 86_400_000
  return new Date(time).toISOString().slice(0, 10)
}

/** `a` is strictly before `b`, compared at the precision they share (partial dates allowed). */
function isBefore(a: string, b: string): boolean {
  const n = Math.min(a.length, b.length)
  return a.slice(0, n) < b.slice(0, n)
}
/** `a` is on or before `b` at the precision they share. */
const notAfter = (a: string, b: string) => !isBefore(b, a)

export function buildActs(machine: MachineLife, chapters: readonly LifeChapter[]): Act[] {
  const arrival = machine.date?.value ?? null
  const life = machine.lifespan ?? null
  const alive = life?.stillWorking?.value ?? false
  const planned = life?.planned?.value ?? null
  const plannedLength = plannedDays(planned)
  const plannedEnd = arrival && FULL.test(arrival) && plannedLength ? addDays(arrival, plannedLength) : null
  const last = lastSignal(life)?.value ?? null
  const end = life?.missionEnd?.value ?? null
  const silentDays = last && end && last !== end ? daysBetween(last, end) : null

  const buckets = new Map<ActKey, LifeChapter[]>()
  const put = (key: ActKey, chapter: LifeChapter) => buckets.set(key, [...(buckets.get(key) ?? []), chapter])

  const keyFor = (date: string): ActKey => {
    if (arrival && isBefore(date, arrival)) return 'departure'
    if (alive) return 'alive'
    if (plannedEnd && notAfter(date, plannedEnd)) return 'planned'
    if (last && notAfter(date, last)) return plannedEnd ? 'beyond' : 'life'
    if (end && notAfter(date, end)) return silentDays ? 'silence' : plannedEnd ? 'beyond' : 'life'
    return 'after'
  }

  // Undated chapters stay with the act of the chapter before them (content order is the story's order).
  let current: ActKey = arrival ? 'departure' : plannedEnd ? 'planned' : 'life'
  for (const chapter of chapters) {
    if (chapter.date) current = keyFor(chapter.date.value)
    put(current, chapter)
  }

  const order: ActKey[] = ['departure', 'alive', 'planned', 'life', 'beyond', 'silence', 'after']
  const acts: Act[] = []
  for (const key of order) {
    const own = buckets.get(key) ?? []
    // Title-only acts: the plan (it states what was expected) and the silence (its length is the story).
    const ratio = key === 'beyond' ? beyondPlan(life, arrival) : null
    const titleOnly = (key === 'planned' && planned && !alive) || (key === 'silence' && silentDays) || (key === 'beyond' && ratio)
    if (own.length === 0 && !titleOnly) continue
    const dated = own.flatMap((chapter) => (chapter.date ? [chapter.date.value] : []))
    const act: Act = { key, chapters: own, from: dated[0] ?? null, to: dated[dated.length - 1] ?? null }
    if (key === 'planned' && planned) act.planned = planned
    if (key === 'beyond') {
      if (ratio) act.ratio = ratio
      if (plannedLength) act.plannedDays = plannedLength
    }
    if (key === 'silence' && silentDays) {
      act.silentDays = silentDays
      act.from = last
      act.to = end
    }
    if (key === 'alive' && arrival) act.since = arrival.slice(0, 4)
    acts.push(act)
  }
  return acts
}

/** Roman numeral of an act (1 → I). */
export function roman(n: number): string {
  const table: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let rest = n
  let out = ''
  for (const [value, symbol] of table) {
    while (rest >= value) {
      out += symbol
      rest -= value
    }
  }
  return out
}
