import { describe, expect, it } from 'vitest'
import type { Lifespan } from '@/api/types'
import { machineHook } from './hook'
import { buildQuiz } from './quiz'

const sourced = <T,>(value: T) => ({ value, sourceIds: ['s'] })
const life = (over: Partial<Lifespan>): Lifespan => ({ status: 'draft', planned: null, lastContact: null, missionEnd: null, stillWorking: null, achievements: [], ...over })

describe('hangar hook (US-5.15)', () => {
  it('prefers "still answering", then the ratio to the plan, then the days lived', () => {
    expect(machineHook({ date: sourced('1969-07-21'), lifespan: life({ stillWorking: sourced(true) }) })).toEqual({ key: 'hook.alive', vars: { year: '1969' } })
    expect(machineHook({ date: sourced('2004-01-25'), lifespan: life({ planned: sourced({ amount: 90, unit: 'sols' }), lastContact: sourced('2018-06-10') }) })).toEqual({
      key: 'hook.beyond',
      vars: { times: 57 },
    })
    expect(machineHook({ date: sourced('1997-07-04'), lifespan: life({ lastContact: sourced('1997-09-27') }) })).toEqual({ key: 'hook.days', vars: { days: 85 } })
    expect(machineHook({ date: null, lifespan: null })).toBeNull()
  })
})

describe('quiz from sourced facts (US-5.15)', () => {
  const machine = {
    id: 'opportunity',
    name: 'Opportunity',
    type: 'rover' as const,
    date: sourced('2004-01-25'),
    status: sourced('mission-ended' as const),
    lifespan: life({ planned: sourced({ amount: 90, unit: 'sols' }), lastContact: sourced('2018-06-10') }),
  }

  it('asks at most three questions, each with exactly one correct option', () => {
    const quiz = buildQuiz(machine, 'Mars')
    expect(quiz.map((q) => q.id)).toEqual(['arrival', 'planned', 'type'])
    for (const question of quiz) expect(question.options.filter((o) => o.correct)).toHaveLength(1)
    expect(quiz[0]!.options.find((o) => o.correct)!.text).toBe('2004')
    expect(quiz[1]!.options.find((o) => o.correct)).toMatchObject({ key: 'machine.unit.sols', vars: { amount: 90 } })
  })

  it('is stable for the same machine and skips what the content does not know', () => {
    expect(buildQuiz(machine, 'Mars')).toEqual(buildQuiz(machine, 'Mars'))
    const bare = buildQuiz({ ...machine, date: null, lifespan: null, status: sourced('unknown' as const) }, 'Mars')
    expect(bare.map((q) => q.id)).toEqual(['type'])
  })
})
