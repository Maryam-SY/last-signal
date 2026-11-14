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
    expect(translate('en', 'app.documentTitle', { page: 'Mars' })).toBe('Mars · AeroReborn')
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
