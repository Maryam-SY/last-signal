import type { TimelineEntry } from '@/api/types'

export interface YearGroup {
  year: number
  entries: TimelineEntry[]
}

/** Groups the (already sorted) entries by year. */
export function groupByYear(entries: readonly TimelineEntry[]): YearGroup[] {
  const groups: YearGroup[] = []
  for (const entry of entries) {
    const year = Number(entry.date.value.slice(0, 4))
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.entries.push(entry)
    else groups.push({ year, entries: [entry] })
  }
  return groups
}
