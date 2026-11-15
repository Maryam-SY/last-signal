import type { Machine, MachineStatus, MachineType } from '@/api/types'
import type { MessageKey } from '@/i18n'
import { plannedDays } from './lifespan'

/**
 * A short quiz built only from the sourced facts of one machine (US-5.15): the year it
 * arrived, how long it was meant to last, what it was, what became of it. The wrong options
 * are deliberately wrong (other years, other amounts, other kinds): they state nothing.
 */
export interface QuizOption {
  /** A ready-made text, or an i18n key to translate. */
  text?: string
  key?: MessageKey
  vars?: Record<string, string | number>
  correct: boolean
}

export interface QuizQuestion {
  id: 'arrival' | 'planned' | 'type' | 'status'
  key: MessageKey
  vars: Record<string, string | number>
  options: QuizOption[]
  /** Said after the answer: the fact, in one sentence (i18n key + vars). */
  explain: { key: MessageKey; vars: Record<string, string | number> }
}

const TYPES: MachineType[] = ['lander', 'rover', 'descent-stage', 'experiment', 'helicopter']
const STATUSES: MachineStatus[] = ['operational', 'contact-lost', 'inactive', 'mission-ended']

/** Deterministic shuffle (same order on every render of the same machine). */
function shuffle<T>(items: T[], seed: string): T[] {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function buildQuiz(machine: Pick<Machine, 'id' | 'name' | 'date' | 'lifespan' | 'type' | 'status'>, world: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const name = machine.name

  const arrival = machine.date?.value
  if (arrival && /^\d{4}/.test(arrival)) {
    const year = Number(arrival.slice(0, 4))
    const options = shuffle([year, year - 6, year + 4, year + 11], machine.id + 'y').map((y) => ({ text: String(y), correct: y === year }))
    questions.push({ id: 'arrival', key: 'quiz.arrival', vars: { name, world }, options, explain: { key: 'quiz.arrivalWhy', vars: { name, year } } })
  }

  const planned = machine.lifespan?.planned?.value
  if (planned) {
    const unitKey = (amount: number): MessageKey => (planned.unit === 'years' && amount === 1 ? 'machine.unit.year' : (`machine.unit.${planned.unit}` as MessageKey))
    const amounts = shuffle([planned.amount, planned.amount * 10, Math.max(1, Math.round(planned.amount / 3)), planned.amount * 100], machine.id + 'p')
    const options = amounts.map((amount) => ({ key: unitKey(amount), vars: { amount }, correct: amount === planned.amount }))
    const days = plannedDays(planned)
    questions.push({
      id: 'planned',
      key: 'quiz.planned',
      vars: { name },
      options,
      explain: { key: days && days < 400 ? 'quiz.plannedWhy' : 'quiz.plannedWhyLong', vars: { name } },
    })
  }

  const typeOptions = shuffle([machine.type, ...TYPES.filter((t) => t !== machine.type).slice(0, 3)], machine.id + 't').map((t) => ({
    key: `machineType.${t}` as MessageKey,
    correct: t === machine.type,
  }))
  questions.push({ id: 'type', key: 'quiz.type', vars: { name }, options: typeOptions, explain: { key: 'quiz.typeWhy', vars: { name } } })

  const status = machine.status.value
  if (status !== 'unknown') {
    const options = shuffle([status, ...STATUSES.filter((s) => s !== status)], machine.id + 's').map((s) => ({ key: `status.${s}` as MessageKey, correct: s === status }))
    questions.push({ id: 'status', key: 'quiz.status', vars: { name }, options, explain: { key: 'quiz.statusWhy', vars: { name } } })
  }

  return questions.slice(0, 3)
}
