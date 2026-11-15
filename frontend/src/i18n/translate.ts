import { en } from './messages/en'
import { fr } from './messages/fr'
import { wo } from './messages/wo'
import type { Locale, MessageKey, Messages, TranslateVars } from './types'

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALES: Record<Locale, Messages> = { en, fr, wo }

/** Language of the content asked to the API: Wolof stories are not written yet (French meanwhile). */
export function contentLang(locale: Locale): 'en' | 'fr' {
  return locale === 'wo' ? 'fr' : locale
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.hasOwn(LOCALES, value)
}

function lookup(messages: Messages, key: MessageKey): string | undefined {
  let node: unknown = messages
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

/** Replaces {name} placeholders; unknown placeholders are left untouched. */
export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  )
}

/**
 * Singular or plural: `{days:day|days}` picks "day" or "days" for the number in `days`, by the
 * language's own rules (English: 1 is singular; French: 0 and 1 are). Numbers may arrive
 * already formatted ("1,234"); unknown or non-numeric values take the plural.
 */
export function pluralize(locale: Locale, template: string, vars?: TranslateVars): string {
  if (!vars) return template
  let rules: Intl.PluralRules
  try {
    rules = new Intl.PluralRules(locale === 'wo' ? 'fr' : locale)
  } catch {
    rules = new Intl.PluralRules('en')
  }
  return template.replace(/\{(\w+):([^|{}]*)\|([^{}]*)\}/g, (match, name: string, one: string, other: string) => {
    if (!Object.hasOwn(vars, name)) return match
    const value = Number(String(vars[name]).replace(/[^\d.-]/g, ''))
    return Number.isFinite(value) && rules.select(value) === 'one' ? one : other
  })
}

/** Falls back to English, then to the key itself, so a missing string is visible but never crashes. */
export function translate(locale: Locale, key: MessageKey, vars?: TranslateVars): string {
  const template = lookup(LOCALES[locale], key) ?? lookup(LOCALES[DEFAULT_LOCALE], key) ?? key
  return interpolate(pluralize(locale, template, vars), vars)
}
