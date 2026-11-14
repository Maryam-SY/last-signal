import { en } from './messages/en'
import { fr } from './messages/fr'
import type { Locale, MessageKey, Messages, TranslateVars } from './types'

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALES: Record<Locale, Messages> = { en, fr }

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

/** Falls back to English, then to the key itself, so a missing string is visible but never crashes. */
export function translate(locale: Locale, key: MessageKey, vars?: TranslateVars): string {
  const template = lookup(LOCALES[locale], key) ?? lookup(LOCALES[DEFAULT_LOCALE], key) ?? key
  return interpolate(template, vars)
}
