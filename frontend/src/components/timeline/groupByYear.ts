export interface YearGroup<T> {
  year: number
  entries: T[]
}

/** Groups the (already sorted) dated entries by year. */
export function groupByYear<T extends { date: { value: string } }>(entries: readonly T[]): YearGroup<T>[] {
  const groups: YearGroup<T>[] = []
  for (const entry of entries) {
    const year = Number(entry.date.value.slice(0, 4))
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.entries.push(entry)
    else groups.push({ year, entries: [entry] })
  }
  return groups
}
