import { LANGS, type Lang, type LocalizedText } from './types.js'

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

function isLocalizedText(value: unknown): value is LocalizedText {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length === LANGS.length && LANGS.every((lang) => typeof (value as Record<string, unknown>)[lang] === 'string')
}

/** Localized<T>: every LocalizedText inside T becomes a plain string. */
export type Localized<T> = T extends LocalizedText
  ? string
  : T extends (infer U)[]
    ? Localized<U>[]
    : T extends object
      ? { [K in keyof T]: Localized<T[K]> }
      : T

/** Deeply replaces every { en, fr } object by the string for `lang`. */
export function localize<T>(value: T, lang: Lang): Localized<T> {
  if (isLocalizedText(value)) return value[lang] as Localized<T>
  if (Array.isArray(value)) return value.map((item) => localize(item, lang)) as Localized<T>
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, localize(item, lang)]),
    ) as Localized<T>
  }
  return value as Localized<T>
}
