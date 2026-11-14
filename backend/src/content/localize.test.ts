import { describe, expect, it } from 'vitest'
import { isLang, localize } from './localize.js'

describe('localize', () => {
  it('replaces nested { en, fr } objects with the requested language', () => {
    const value = {
      id: 'x',
      title: { en: 'Moon', fr: 'Lune' },
      list: [{ text: { en: 'Fact', fr: 'Fait' }, sourceIds: ['a'] }],
      coordinates: { lat: 1, lon: 2 },
      empty: null,
    }
    expect(localize(value, 'fr')).toEqual({
      id: 'x',
      title: 'Lune',
      list: [{ text: 'Fait', sourceIds: ['a'] }],
      coordinates: { lat: 1, lon: 2 },
      empty: null,
    })
  })

  it('does not touch objects that only look partly localized', () => {
    expect(localize({ en: 'a', fr: 'b', extra: 1 }, 'en')).toEqual({ en: 'a', fr: 'b', extra: 1 })
  })

  it('recognises supported languages only', () => {
    expect(isLang('fr')).toBe(true)
    expect(isLang('de')).toBe(false)
  })
})
