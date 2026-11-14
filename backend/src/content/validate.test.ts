import { describe, expect, it } from 'vitest'
import { loadContent } from './load.js'
import type { Content } from './types.js'
import { validateContent } from './validate.js'

const real = loadContent()
const clone = (): Content => structuredClone(real)
const errorsOf = (content: Content) => validateContent(content).errors

describe('content integrity (real content)', () => {
  it('has no integrity error', () => {
    expect(errorsOf(real)).toEqual([])
  })

  it('only covers the Moon and Mars', () => {
    expect(real.destinations.map((d) => d.id).sort()).toEqual(['mars', 'moon'])
  })

  it('contains the four stories chosen by the team, all still in draft', () => {
    expect(real.stories.map((s) => s.id).sort()).toEqual([
      'mars-ingenuity',
      'mars-spirit-opportunity',
      'moon-apollo11-retroreflectors',
      'moon-surveyor-apollo12',
    ])
    // Only a human reviewer may mark a story as reviewed (CLAUDE.md §7).
    expect(real.stories.every((s) => s.status === 'draft')).toBe(true)
  })

  it('never displays a machine outside the scope (no Pioneer 10)', () => {
    expect(JSON.stringify(real).toLowerCase()).not.toContain('pioneer')
  })
})

describe('content integrity (rules)', () => {
  it('rejects an unknown source', () => {
    const c = clone()
    c.machines[0]!.status.sourceIds = ['does-not-exist']
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('unknown source "does-not-exist"'))
  })

  it('rejects a fact without source', () => {
    const c = clone()
    c.machines[0]!.status.sourceIds = []
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('needs at least 1 source'))
  })

  it('rejects coordinates out of range', () => {
    const c = clone()
    const machine = c.machines.find((m) => m.coordinates !== null)!
    machine.coordinates!.value.lon = 336.582
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('longitude out of [-180, 180]'))
  })

  it('rejects a destination other than the Moon or Mars', () => {
    const c = clone()
    c.missions[0]!.destinationId = 'vesta' as never
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('unknown destination "vesta"'))
  })

  it('rejects a story whose steps are not the six steps in order', () => {
    const c = clone()
    const steps = c.stories[0]!.steps
    ;[steps[0], steps[1]] = [steps[1]!, steps[0]!]
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('steps must be exactly'))
  })

  it('rejects a "data" block without source', () => {
    const c = clone()
    const block = c.stories[0]!.steps[0]!.blocks[0]!
    block.voice = 'data'
    block.sourceIds = []
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('needs at least 1 source'))
  })

  it('rejects relations outside the relay step', () => {
    const c = clone()
    c.stories[0]!.steps[0]!.relationIds = [c.relations[0]!.id]
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('only allowed in the relay step'))
  })

  it('rejects a main story that does not list its mission', () => {
    const c = clone()
    const mission = c.missions.find((m) => m.id === 'apollo-12')!
    mission.mainStoryId = 'mars-ingenuity'
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('does not list this mission'))
  })

  it('rejects missing translations', () => {
    const c = clone()
    c.missions[0]!.summary = { en: 'Only English', fr: '' }
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('missing "fr" text'))
  })

  it('rejects an invalid date', () => {
    const c = clone()
    c.machines[0]!.date!.value = '1967-13-40'
    expect(errorsOf(c)).toContainEqual(expect.stringContaining('invalid date'))
  })
})
