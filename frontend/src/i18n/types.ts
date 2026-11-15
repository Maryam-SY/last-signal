import type { en } from './messages/en'

/** Same shape as the English dictionary, with every leaf widened to `string`. */
type Widen<T> = { readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }

export type Messages = Widen<typeof en>

/** Dotted path to every string leaf, e.g. "nav.explore". */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageKey = Leaves<Messages>

/** Wolof (`wo`) covers the interface; content is served in French until translated (US-5.12). */
export type Locale = 'en' | 'fr' | 'wo'

export type TranslateVars = Record<string, string | number>

export type Translate = (key: MessageKey, vars?: TranslateVars) => string
