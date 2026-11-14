import { describe, expect, it } from 'vitest'
import { translate } from '@/i18n'
import type { MessageKey } from '@/i18n'
import { formatCoordinates, formatPartialDate } from './format'
import { parseStep } from './story'

describe('formatPartialDate', () => {
  it('keeps the precision of the source', () => {
    expect(formatPartialDate('1969', 'en')).toBe('1969')
    expect(formatPartialDate('1969-11', 'en')).toBe('November 1969')
    expect(formatPartialDate('1969-11-19', 'en')).toBe('November 19, 1969')
    expect(formatPartialDate('1969-11-19', 'fr')).toBe('19 novembre 1969')
  })
})

describe('formatCoordinates', () => {
  it('uses hemisphere letters instead of signs', () => {
    const t = (key: MessageKey) => translate('en', key)
    expect(formatCoordinates({ lat: -3.01, lon: -23.42 }, t)).toBe('3.01° S, 23.42° W')
    expect(formatCoordinates({ lat: 1.95, lon: 354.47 - 360 }, t)).toBe('1.95° N, 5.53° W')
    const fr = (key: MessageKey) => translate('fr', key)
    expect(formatCoordinates({ lat: 0, lon: -10 }, fr)).toBe('0° N, 10° O')
  })
})

describe('parseStep', () => {
  it('accepts 1 to 6 and falls back to 1', () => {
    expect(parseStep('4')).toBe(4)
    expect(parseStep(null)).toBe(1)
    expect(parseStep('0')).toBe(1)
    expect(parseStep('7')).toBe(1)
    expect(parseStep('2.5')).toBe(1)
  })
})
