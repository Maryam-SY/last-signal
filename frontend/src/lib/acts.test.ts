import { describe, expect, it } from 'vitest'
import type { Lifespan } from '@/api/types'
import type { LifeChapter } from './journey'
import { buildActs, roman } from './acts'

const chapter = (id: string, date: string | null): LifeChapter => ({ id, date: date ? { value: date, sourceIds: ['s'] } : null, title: id, text: id })
const sourced = <T,>(value: T) => ({ value, sourceIds: ['s'] })

describe('acts of a machine life (US-5.14)', () => {
  it('splits a rover that outlived its plan into departure, plan, beyond, silence and after', () => {
    const lifespan: Lifespan = {
      status: 'draft',
      planned: sourced({ amount: 90, unit: 'sols' }),
      lastContact: sourced('2018-06-10'),
      missionEnd: sourced('2019-02-13'),
      stillWorking: null,
      achievements: [],
    }
    const chapters = [
      chapter('launch', '2003-07-08'),
      chapter('landing', '2004-01-25'),
      chapter('water', '2004-03-02'),
      chapter('victoria', '2007-09-11'),
      chapter('undated', null),
      chapter('storm', '2018-06-10'),
      chapter('farewell', '2019-02-13'),
      chapter('orbit-view', '2022'),
    ]
    const acts = buildActs({ date: sourced('2004-01-25'), lifespan }, chapters)
    expect(acts.map((act) => [act.key, act.chapters.map((c) => c.id)])).toEqual([
      ['departure', ['launch']],
      ['planned', ['landing', 'water']],
      ['beyond', ['victoria', 'undated', 'storm']],
      ['silence', ['farewell']],
      ['after', ['orbit-view']],
    ])
    expect(acts[2]!.ratio).toBeGreaterThan(50)
    expect(acts[3]!.silentDays).toBe(248)
  })

  it('keeps the plan and the silence as title-only acts when no chapter falls in them', () => {
    const lifespan: Lifespan = {
      status: 'draft',
      planned: sourced({ amount: 30, unit: 'days' }),
      lastContact: sourced('1997-09-27'),
      missionEnd: sourced('1998-03-10'),
      stillWorking: null,
      achievements: [],
    }
    const acts = buildActs({ date: sourced('1997-07-04'), lifespan }, [chapter('late', '1997-09-01')])
    expect(acts.map((act) => act.key)).toEqual(['planned', 'beyond', 'silence'])
    expect(acts[0]!.chapters).toHaveLength(0)
    expect(acts[0]!.planned).toEqual({ amount: 30, unit: 'days' })
  })

  it('gives a machine that still works one "alive" act after its departure', () => {
    const lifespan: Lifespan = { status: 'draft', planned: null, lastContact: null, missionEnd: null, stillWorking: sourced(true), achievements: [] }
    const acts = buildActs({ date: sourced('1969-07-21'), lifespan }, [chapter('launch', '1969-07-16'), chapter('ranging', '1969-08-01'), chapter('today', '2019')])
    expect(acts.map((act) => [act.key, act.chapters.length])).toEqual([
      ['departure', 1],
      ['alive', 2],
    ])
    expect(acts[1]!.since).toBe('1969')
  })

  it('falls back to one "life" act when no planned duration is known', () => {
    const lifespan: Lifespan = { status: 'draft', planned: null, lastContact: sourced('1967-05-04'), missionEnd: null, stillWorking: null, achievements: [] }
    const acts = buildActs({ date: sourced('1967-04-20'), lifespan }, [chapter('work', '1967-04-25'), chapter('visit', '1969-11-20')])
    expect(acts.map((act) => act.key)).toEqual(['life', 'after'])
  })

  it('writes roman numerals', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(roman)).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'IX'])
  })
})
