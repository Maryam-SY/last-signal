import type { Lang } from '@/api/types'

/**
 * Formats a partial ISO date ("1969", "1969-07", "1969-07-20") for display, keeping only the
 * precision the source gives. Uses UTC so a date never shifts by one day across time zones.
 */
export function formatPartialDate(value: string, lang: Lang | 'wo'): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year) return value
  // Wolof month names are not available everywhere: French dates meanwhile.
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1))
  if (day) return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  if (month) return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  return String(year)
}
