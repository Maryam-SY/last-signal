import { describe, expect, it } from 'vitest'
import { en } from './messages/en'
import { fr } from './messages/fr'
import { interpolate, isLocale, translate } from './translate'
import type { MessageKey } from './types'

function keysOf(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix]
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    keysOf(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('i18n', () => {
  it('has exactly the same keys in every locale', () => {
    expect(keysOf(fr).sort()).toEqual(keysOf(en).sort())
  })

  it('has no empty string in any locale', () => {
    for (const messages of [en, fr]) {
      for (const key of keysOf(messages)) {
        expect(translate(messages === en ? 'en' : 'fr', key as MessageKey).trim(), key).not.toBe('')
      }
    }
  })

  it('translates a key for the requested locale', () => {
    expect(translate('en', 'nav.explore')).toBe('Explore')
    expect(translate('fr', 'nav.explore')).toBe('Explorer')
  })

  it('interpolates placeholders and keeps unknown ones visible', () => {
    expect(translate('en', 'app.documentTitle', { page: 'Mars' })).toBe('Mars · OrbeMoria')
    expect(interpolate('Hello {name} {missing}', { name: 'Ada' })).toBe('Hello Ada {missing}')
  })

  it('falls back to the key when a string is missing', () => {
    expect(translate('en', 'does.not.exist' as MessageKey)).toBe('does.not.exist')
  })

  it('recognises supported locales only', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale('toString')).toBe(false)
  })
})

describe('singular and plural', () => {
  it('says "1 day" and "2 days" in English (team report: "Worked 1 days")', () => {
    expect(translate('en', 'hook.days', { days: 1 })).toBe('Worked 1 day, then fell silent')
    expect(translate('en', 'hook.days', { days: 37 })).toBe('Worked 37 days, then fell silent')
    expect(translate('en', 'machine.durationYears', { years: 1, months: 1 })).toBe('1 year, 1 month')
    expect(translate('en', 'machine.clockBefore', { days: '1,204' })).toBe('1,204 days before arrival')
  })

  it('follows the French rule: 0 and 1 are singular', () => {
    expect(translate('fr', 'machine.durationDays', { days: 0 })).toBe('0 jour')
    expect(translate('fr', 'machine.durationDays', { days: 1 })).toBe('1 jour')
    expect(translate('fr', 'machine.durationDays', { days: 2 })).toBe('2 jours')
    expect(translate('fr', 'machine.unit.sols', { amount: 90 })).toBe('90 jours martiens')
  })
})

