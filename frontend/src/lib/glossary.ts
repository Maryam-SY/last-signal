import type { GlossaryEntry } from '@/api/types'
import type { Locale } from '@/i18n'

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Glossary entries whose words appear in `texts` (whole words, any case), in glossary order.
 * Used to show "Words to know" next to the story step that actually uses them.
 */
export function wordsIn(texts: readonly string[], glossary: readonly GlossaryEntry[], locale: Locale): GlossaryEntry[] {
  const haystack = texts.join('\n')
  return glossary.filter((entry) =>
    entry.terms[locale].some((term) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, 'iu').test(haystack)),
  )
}
