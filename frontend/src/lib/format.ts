import type { Coordinates } from '@/types/content'
import type { Locale, Translate } from '@/i18n'

/** "1969" → "1969", "1969-11" → "November 1969", "1969-11-19" → "November 19, 1969" (UTC, no shift). */
export function formatPartialDate(date: string, locale: Locale): string {
  const [year, month, day] = date.split('-').map(Number)
  if (year === undefined || Number.isNaN(year)) return date
  if (month === undefined) return String(year)
  const value = new Date(Date.UTC(year, month - 1, day ?? 1))
  const options: Intl.DateTimeFormatOptions =
    day === undefined
      ? { year: 'numeric', month: 'long', timeZone: 'UTC' }
      : { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(locale, options).format(value)
}

/** 3.01, -23.42 → "3.01° N, 23.42° W" (letters come from the dictionary). */
export function formatCoordinates({ lat, lon }: Coordinates, t: Translate): string {
  const latLabel = t(lat < 0 ? 'geo.south' : 'geo.north')
  const lonLabel = t(lon < 0 ? 'geo.west' : 'geo.east')
  const number = (value: number) => Math.abs(value).toFixed(2).replace(/\.?0+$/, '')
  return `${number(lat)}° ${latLabel}, ${number(lon)}° ${lonLabel}`
}
